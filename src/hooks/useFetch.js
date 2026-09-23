import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

/**
 * Ambil data dari API dengan state loading/error yang seragam.
 *
 * `params` boleh berupa objek literal baru setiap render — perbandingannya
 * memakai hasil serialisasi, bukan identitas objek, supaya tidak memicu
 * perulangan fetch tanpa henti.
 *
 * State hanya disentuh dari callback asinkron; status `loading` diturunkan
 * saat render dengan membandingkan permintaan yang diminta dan yang sudah
 * selesai, sehingga tidak ada setState sinkron di dalam effect.
 */
export function useFetch(path, { params, enabled = true } = {}) {
  const paramsKey = JSON.stringify(params ?? null)

  const [reloadToken, setReloadToken] = useState(0)
  const reload = useCallback(() => setReloadToken((n) => n + 1), [])

  const isActive = enabled && Boolean(path)
  const requestKey = isActive ? `${path}|${paramsKey}|${reloadToken}` : null

  const [result, setResult] = useState({ key: null, data: null, meta: null, error: null })

  useEffect(() => {
    if (!requestKey) return

    const controller = new AbortController()
    let alive = true

    api
      .get(path, { params: JSON.parse(paramsKey) ?? undefined, signal: controller.signal })
      .then((envelope) => {
        if (!alive) return
        setResult({
          key: requestKey,
          data: envelope.data,
          meta: envelope.meta ?? null,
          error: null,
        })
      })
      .catch((error) => {
        // Permintaan yang dibatalkan bukan kegagalan.
        if (!alive || controller.signal.aborted) return
        setResult({ key: requestKey, data: null, meta: null, error })
      })

    return () => {
      alive = false
      controller.abort()
    }
  }, [requestKey, path, paramsKey])

  const isSettled = result.key === requestKey

  return {
    data: isSettled ? result.data : null,
    meta: isSettled ? result.meta : null,
    loading: isActive && !isSettled,
    error: isSettled ? result.error : null,
    reload,
  }
}
