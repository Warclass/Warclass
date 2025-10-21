"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

import { Button } from "@/components/ui/button";
import GuestLayout from "@/app/layouts/GuestLayout";

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
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
      const size = Math.min(window.innerWidth * 0.4, 500);
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
      <div className="max-h-screen overflow-hidden relative w-full">
        <header className="absolute top-0 w-full z-20 p-6 bg-gradient-to-b from-black/50 to-transparent">
          <nav className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="text-white text-2xl font-bold">Warclass</div>
            <div className="flex gap-4">
              <Link href="/auth/login">
                <Button variant="outline">Iniciar Sesión</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="default">Registrarse</Button>
              </Link>
            </div>
          </nav>
        </header>

        <section className="w-full relative">
          <div className="absolute bottom-0 w-full z-10">
            <div className="flex flex-row-reverse w-full p-0 xl:pr-16 justify-center xl:justify-normal">
              <div className="flex flex-col p-8 rounded-t-3xl bg-neutral-900/95 backdrop-blur-sm gap-4 text-white text-center xl:text-left border-t-4 border-neutral-400">
                <h1 className="text-7xl font-extrabold bg-gradient-to-r from-neutral-200 to-neutral-400 text-transparent bg-clip-text">
                  Warclass
                </h1>
                <p className="text-3xl font-medium text-neutral-200">
                  De aprobar sin entender, a aprender disfrutando
                </p>
                <p className="text-lg text-neutral-300">
                  Transformamos las tareas en misiones interactivas en un mundo
                  virtual 3D
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-96 w-screen h-full brightness-[85%] -z-10 bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900 flex items-center justify-center">
            <div className="text-neutral-400 text-6xl font-bold opacity-20">
              WARCLASS
            </div>
          </div>
        </section>
      </div>

      <section className="bg-background py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              El Problema Real en la Educación
            </h2>
            <p className="text-2xl text-neutral-600 dark:text-neutral-400">
              El ciclo de aprobar sin aprender
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-neutral-100 dark:bg-neutral-800 p-8 rounded-xl border-l-4 border-red-500">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                📋 La Situación Actual
              </h3>
              <ul className="space-y-3 text-lg text-neutral-700 dark:text-neutral-300">
                <li>• Tareas que no conectan con la vida real</li>
                <li>• Estudiantes que buscan solo aprobar</li>
                <li>• Copiar de internet sin comprender</li>
                <li>• IA que da respuestas sin aprendizaje</li>
              </ul>
            </div>

            <div className="bg-neutral-100 dark:bg-neutral-800 p-8 rounded-xl border-l-4 border-amber-500">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                ⚠️ El Resultado
              </h3>
              <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-4">
                Las herramientas actuales se convierten en atajos que mantienen
                el ciclo:
              </p>
              <p className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 italic">
                &ldquo;Cumplen la tarea → Aprueban → Pero no aprenden
                nada&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 dark:bg-neutral-900 py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              ¿Y si las herramientas fueran diferentes?
            </h2>
            <p className="text-2xl text-neutral-600 dark:text-neutral-400">
              De atajos que evitan aprender, a herramientas que motivan el
              aprendizaje real
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 flex flex-col gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-xl border-l-4 border-green-500">
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                  🎮 Nuestra Solución
                </h3>
                <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-4">
                  Una plataforma educativa basada en gamificación dentro de un{" "}
                  <span className="font-bold">mundo virtual 3D</span>.
                </p>
                <ul className="space-y-3 text-lg text-neutral-700 dark:text-neutral-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      ✓
                    </span>
                    <span>
                      Las tareas se convierten en{" "}
                      <strong>misiones dinámicas</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      ✓
                    </span>
                    <span>
                      El aprendizaje se vuelve una{" "}
                      <strong>experiencia interactiva</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      ✓
                    </span>
                    <span>
                      Cada logro <strong>refuerza el conocimiento real</strong>
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-xl">
                <p className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 text-center">
                  Cambiamos el enfoque:
                  <br />
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Usar herramientas solo para aprobar
                  </span>
                  <br />
                  <span className="text-green-600 dark:text-green-400">↓</span>
                  <br />
                  <span className="text-green-600 dark:text-green-400">
                    Usar herramientas para aprender, disfrutar y aplicar
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-center flex-1 lg:w-1/2">
              <canvas
                ref={canvasRef}
                id="canvas"
                className="max-w-full h-auto rounded-xl shadow-2xl border-4 border-neutral-300 dark:border-neutral-700"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8 bg-neutral-200 py-24 px-8 mx-auto w-full text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-bold mb-8">Nuestra Misión</h2>
          <p className="text-2xl leading-relaxed mb-6">
            Mejorar la experiencia educativa mediante la integración de
            elementos de gamificación, aventuras de aprendizaje personalizadas y
            aprendizaje socioemocional en el entorno del aula.
          </p>
          <p className="text-xl italic">
            Nuestro objetivo: estudiantes más felices, comprometidos y que
            realmente aprenden.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-16 items-center bg-background w-full py-24 px-8 mx-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              ¿Qué ofrecemos?
            </h2>
            <p className="text-2xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Una experiencia educativa completa que transforma el aprendizaje
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-50 dark:bg-neutral-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-blue-500">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Gamificación Real
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Conectamos a los alumnos a través de principios recreativos para
                incentivar el aprendizaje y desarrollar habilidades cognitivas.
              </p>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-purple-500">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Mundo Virtual 3D
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Un entorno inmersivo donde las misiones educativas cobran vida,
                haciendo que cada tarea sea una aventura memorable.
              </p>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-green-500">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Aprendizaje Competitivo
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Sistema de apoyo multinivel donde los estudiantes progresan
                mediante competencias sanas que refuerzan el conocimiento.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-neutral-700 hover:bg-neutral-800"
              >
                Únete a la Comunidad
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-neutral-900 text-neutral-100 border-t-4 border-neutral-700">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-neutral-200 to-neutral-400 text-transparent bg-clip-text">
                Warclass{" "}
              </h3>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Transformando la educación mediante gamificación en mundos
                virtuales 3D. Donde las tareas se convierten en aventuras y el
                aprendizaje en una experiencia memorable.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://github.com/World-of-Warclass"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-neutral-800 hover:bg-neutral-700 p-3 rounded-lg transition-colors"
                  aria-label="GitHub"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-neutral-200">
                Equipo
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    Acerca de nosotros
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    Contacto
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    Nuestro equipo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-neutral-200">
                Recursos
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://github.com/World-of-Warclass"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    Documentación
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    Agradecimientos
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-neutral-500 text-sm">
                © {new Date().getFullYear()} Warclass. Transformando la
                educación mediante gamificación.
              </p>
              <div className="flex gap-6 text-sm">
                <a
                  href="#"
                  className="text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Privacidad
                </a>
                <a
                  href="#"
                  className="text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Términos
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </GuestLayout>
  );
}
