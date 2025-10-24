"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { Gamepad2, Globe2, Trophy, CheckCircle2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GuestLayout from "@/app/layouts/GuestLayout";

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // No carousel; we will render three informational cards at the end

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.7;
    renderer.setPixelRatio(window.devicePixelRatio);

    canvas.setAttribute("tabindex", "0");
    canvas.style.outline = "none";

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    let mixer: THREE.AnimationMixer | null = null;
    const loader = new FBXLoader();
    loader.load(
      "/models/welcome_scene/Dragon_WoWc.fbx",
      (object) => {
        object.scale.set(0.02, 0.02, 0.02);
        object.position.set(0, -4, 0);
        mixer = new THREE.AnimationMixer(object);
        if (object.animations && object.animations.length > 0) {
          const action = mixer.clipAction(object.animations[0]);
          action.setLoop(THREE.LoopPingPong, Infinity);
          action.play();
        }
        scene.add(object);
      },
      undefined,
      (error) => {
        console.error("Error loading dragon:", error);
      }
    );

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) / 100;
      mouseY = (e.clientY - window.innerHeight / 2) / 100;
    };
    document.addEventListener("mousemove", handleMouseMove);

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);

      if (mixer) mixer.update(clock.getDelta());

      camera.position.x += (-mouseX - camera.position.x) * 0.06;
      camera.position.y += (mouseY - camera.position.y) * 0.06;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }
    animate();

    function resizeRenderer() {
      // Reduce canvas size to lower the overall section height
      const size = Math.min(window.innerWidth * 0.36, 420);
      renderer.setSize(size, size);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resizeRenderer);
    resizeRenderer();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resizeRenderer);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <GuestLayout>
      {/* Top info bar */}
      <div className="w-full bg-[#0f0f0f] text-xs text-neutral-300 py-2 px-4">
        <div className="max-w-7xl mx-auto text-center">
          ¿Deseas unirte como una institución?{' '}
          <a href="#contacto" className="text-[#D89216] hover:underline">¡Contáctanos!</a>
        </div>
      </div>

      {/* Hero */}
      <header className="relative isolate w-full bg-[#151515]">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-sm bg-[#D89216]" />
            <span className="text-sm tracking-widest text-neutral-300">WORLD OF WARCLASS</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/auth/login" className="uppercase text-neutral-200 text-sm tracking-wide hover:text-white">Login</Link>
            <span className="h-4 w-px bg-neutral-700" />
            <Link href="/auth/register" className="uppercase text-neutral-200 text-sm tracking-wide hover:text-white relative after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:bg-[#D89216] after:opacity-80">Register</Link>
          </div>
        </nav>

        {/* Simulated image block + headline overlay to match reference */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-end px-6 pb-8">
          <div className="lg:col-span-8 min-h-[320px] lg:min-h-[480px] rounded-md bg-gradient-to-br from-neutral-600 via-neutral-700 to-neutral-900 shadow-inner" />
          <div className="lg:col-span-4" />
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-7xl mx-auto px-6 pb-6 flex justify-end">
            <div className="rounded-lg bg-[#D89216] shadow-xl">
              <div className="px-6 py-5">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">World of Warclass</h1>
                <p className="mt-2 text-sm sm:text-base text-white/95">Transformando tareas en verdadero aprendizaje</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ¿Qué es? */}
      <section className="bg-[#1a1a1a] text-neutral-100">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6 px-6 py-8 lg:py-12 items-center">
          <div className="lg:col-span-6 self-center space-y-6">
            <div className="flex items-center gap-3">
              <span className="inline-block h-1.5 w-10 rounded bg-[#D89216]" />
                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-neutral-100">¿Qué es "World of Warclass"?</h2>
            </div>
            <p className="max-w-2xl text-lg leading-relaxed text-neutral-300">
              Plataforma educativa innovadora que transforma tareas en misiones dentro de un mundo virtual 3D.
            </p>
            <div className="grid sm:grid-cols-2 gap-5 pt-1">
                <div className="border-l-4 border-[#D89216] pl-4">
                  <h3 className="text-base font-semibold text-neutral-100 mb-2">Nuestros Objetivos</h3>
                  <ul className="space-y-2 text-sm text-neutral-300">
                    <li className="flex gap-2"><CheckCircle2 className="text-[#D89216] mt-[2px]" size={16} /> Incentivar el aprendizaje con misiones y recompensas.</li>
                    <li className="flex gap-2"><CheckCircle2 className="text-[#D89216] mt-[2px]" size={16} /> Conectar contenidos con experiencias interactivas.</li>
                    <li className="flex gap-2"><CheckCircle2 className="text-[#D89216] mt-[2px]" size={16} /> Fomentar el trabajo en equipo y la creatividad.</li>
                  </ul>
                </div>
                <div className="border-l-4 border-[#D89216] pl-4">
                  <h3 className="text-base font-semibold text-neutral-100 mb-2">Para Docentes</h3>
                  <ul className="space-y-2 text-sm text-neutral-300">
                    <li className="flex gap-2"><CheckCircle2 className="text-[#D89216] mt-[2px]" size={16} /> Diseña tareas como misiones.</li>
                    <li className="flex gap-2"><CheckCircle2 className="text-[#D89216] mt-[2px]" size={16} /> Seguimiento del progreso y feedback claro.</li>
                    <li className="flex gap-2"><CheckCircle2 className="text-[#D89216] mt-[2px]" size={16} /> Aulas más activas y comprometidas.</li>
                  </ul>
                </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex items-center justify-center">
            {/* Canvas sin borde ni sombra para que se integre con el fondo */}
            <canvas ref={canvasRef} id="canvas" className="max-w-full h-auto" />
          </div>
        </div>
      </section>

      {/* Misión */}
      <section className="relative isolate bg-[#D89216] text-black">
        <div className="absolute inset-0 pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent)] opacity-20" />
        <div className="max-w-7xl mx-auto px-6 py-14 md:py-16 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">Nuestra misión</h3>
          <p className="mt-3 max-w-4xl mx-auto text-base md:text-lg font-medium leading-relaxed">
            Mejorar la experiencia educativa integrando gamificación, aventuras de aprendizaje personalizadas y recursos digitales,
            para construir un entorno inmersivo donde los estudiantes desarrollen habilidades reales y comprensibles.
          </p>
        </div>
      </section>

      {/* Tenemos esto para ti - 3 tarjetas */}
      <section className="bg-[#1a1a1a] text-neutral-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h3 className="text-2xl font-semibold text-neutral-200">Tenemos esto para ti</h3>
            <p className="mt-2 text-neutral-400">Sé parte de nuestra comunidad y accede a los servicios digitales de nuestra plataforma.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-[#121212] border-neutral-800">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-[#D89216]/20 text-[#D89216]"><Gamepad2 size={20} /></div>
                  <CardTitle className="text-lg">Misiones y retos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-neutral-300">Motiva con objetivos claros, recompensas y progresión visible para cada estudiante.</CardContent>
            </Card>

            <Card className="bg-[#121212] border-neutral-800">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-[#D89216]/20 text-[#D89216]"><Globe2 size={20} /></div>
                  <CardTitle className="text-lg">Mundo virtual 3D</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-neutral-300">Explora escenarios temáticos e interactivos que convierten el aprendizaje en aventura.</CardContent>
            </Card>

            <Card className="bg-[#121212] border-neutral-800">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-[#D89216]/20 text-[#D89216]"><Trophy size={20} /></div>
                  <CardTitle className="text-lg">Trabajo colaborativo</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-neutral-300">Coopera en grupos, comparte logros y desarrolla habilidades sociales.</CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-[#D89216] hover:bg-[#b6770f] text-black font-semibold px-8">Comenzar ahora</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer minimal retains existing */}
      <footer className="bg-[#0f0f0f] text-neutral-400">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-xs">
          <span>© {new Date().getFullYear()} Warclass</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-neutral-200">Privacidad</a>
            <a href="#" className="hover:text-neutral-200">Términos</a>
          </div>
        </div>
      </footer>
    </GuestLayout>
  );
}
        
