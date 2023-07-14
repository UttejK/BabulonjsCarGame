import React, { useEffect, useRef, useState } from "react";
import {
  Engine,
  Scene,
  HemisphericLight,
  Color4,
  Vector3,
  ArcRotateCamera,
  SceneLoader,
  MeshBuilder,
  CannonJSPlugin,
  PhysicsImpostorParameters,
  PhysicsImpostor,
  PhysicsEngine,
  AbstractMesh,
} from "@babylonjs/core";
// import * as BABYLON from "babylonjs";
import "@babylonjs/loaders";
// Import cannon js
import * as CANNON from "cannon";

interface CanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Canvas: React.FC<CanvasProps> = ({ canvasRef }) => {
  return <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh" }} />;
};

const BabylonScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
  }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const engine = new Engine(canvasRef.current, true);
      const scene = new Scene(engine);
      // Create a physics engine

      let gravityX = 0;
      const physicsPlugin = new CannonJSPlugin(true, 10, CANNON);
      scene.enablePhysics(new Vector3(gravityX, -9.81, 0), physicsPlugin);

      // Set the background color to white
      scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

      // Create a hemispheric light to illuminate the scene
      const light = new HemisphericLight(
        "light",
        new Vector3(0, 100, 0),
        scene
      );
      light.intensity = 0.9;

      //Create a ground Plane
      const plane = MeshBuilder.CreatePlane("plane", { size: 50 }, scene);
      plane.rotate(new Vector3(1, 0, 0), Math.PI / 2);
      plane.physicsImpostor = new PhysicsImpostor(
        plane,
        PhysicsImpostor.BoxImpostor,
        { mass: 0, friction: 0.5, restitution: 0.7 },
        scene
      );

      // Import the car mesh

      let car: AbstractMesh | null = null;

      const importCar = async () => {
        const result = await SceneLoader.ImportMeshAsync(
          "",
          "/",
          "Car.glb",
          scene,
          undefined,
          ".glb"
        );
        car = result.meshes[0]; // Values from 6 are for the tyres
        // Create a compound impostor for the car
        const compoundImpostor = new PhysicsImpostor(
          car,
          PhysicsImpostor.BoxImpostor,
          {
            mass: 1,
            friction: 1,
          },
          scene
        );
      };

      importCar();

      // Handle keyboard inputs for car control
      const keysPressed: { [key: string]: boolean } = {};
      scene.onKeyboardObservable.add((kbInfo) => {
        if (car) {
          const key = kbInfo.event.key;
          const isKeyDown = kbInfo.type === 1;
          keysPressed[key] = isKeyDown;

          // Car movement controls
          const speed = 1;
          const rotationSpeed = 0.2;

          if (keysPressed["w"] || keysPressed["ArrowUp"]) {
            car.moveWithCollisions(car.right.scale(-speed));
          }
          if (keysPressed["s"] || keysPressed["ArrowDown"]) {
            car.moveWithCollisions(car.right.scale(speed));
          }
          if (keysPressed["a"] || keysPressed["ArrowLeft"]) {
            car.rotate(Vector3.Up(), -rotationSpeed);
          }
          if (keysPressed["d"] || keysPressed["ArrowRight"]) {
            car.rotate(Vector3.Up(), rotationSpeed);
          }
        }
      });
      // Create a camera
      const camera = new ArcRotateCamera(
        "camera",
        0,
        0,
        10,
        Vector3.Zero(),
        scene
      );
      camera.position = new Vector3(0, 10, 10);
      camera.attachControl(canvasRef.current, true);

      engine.runRenderLoop(() => {
        scene.render();
      });

      return () => {
        engine.stopRenderLoop();
        scene.dispose();
      };
    }
  }, [screenSize]);

  return <Canvas canvasRef={canvasRef} />;
};

export default BabylonScene;
