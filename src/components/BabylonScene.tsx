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
      const physicsPlugin = new CannonJSPlugin(true, 10, CANNON);
      scene.enablePhysics(new Vector3(0, -9.81, 0), physicsPlugin);

      // Set the background color to white
      scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

      // Create a hemispheric light to illuminate the scene
      const light = new HemisphericLight(
        "light",
        new Vector3(0, 1000, 0),
        scene
      );

      // Create a camera
      const camera = new ArcRotateCamera(
        "camera",
        0,
        0,
        10,
        Vector3.Zero(),
        scene
      );
      camera.position = new Vector3(0, 5, 5);
      camera.attachControl(canvasRef.current, true);

      //Create a ground Plane
      const plane = MeshBuilder.CreatePlane("plane", { size: 10 }, scene);
      plane.rotate(new Vector3(1, 0, 0), Math.PI / 2);
      plane.physicsImpostor = new PhysicsImpostor(
        plane,
        PhysicsImpostor.BoxImpostor,
        { mass: 0, friction: 0.5, restitution: 0.7 },
        scene
      );

      // Import the car mesh
      const importCar = async () => {
        const result = await SceneLoader.ImportMeshAsync(
          "",
          "/",
          "Car.glb",
          scene,
          undefined,
          ".glb"
        );
        const car = result.meshes[0];
        // Create a compound impostor for the car
        const compoundImpostor = new PhysicsImpostor(
          car,
          PhysicsImpostor.ConvexHullImpostor,
          {
            mass: 1,
            friction: 1,
          },
          scene
        );
      };

      importCar();

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
