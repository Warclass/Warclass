'use client'

import { useEffect, useRef, useState } from 'react'

export default function CharacterPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    return (
        <section id="scene" className="flex flex-grow h-full w-full max-h-full max-w-full">
            {isLoading && (
                <div
                    id="loading"
                    role="alert"
                    className="h-full w-full max-h-full max-w-full bg-neutral-900 transition-opacity duration-300 ease-linear fixed z-10 flex justify-center items-center"
                >
                    <div className="flex h-full justify-center items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500" />
                    </div>
                </div>
            )}

            <canvas
                ref={canvasRef}
                id="canvas"
                className="fixed w-full h-full"
            />
        </section>
    )
}
