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
  AbstractMesh,
  ActionManager,
  ExecuteCodeAction,
} from "@babylonjs/core";
import "@babylonjs/loaders";

import {} from "@babylonjs/loaders/glTF";

// import carMesh from "./Car.glb";

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

      // Set the background color to white
      scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

      // Create a hemispheric light to illuminate the scene
      const light = new HemisphericLight(
        "light",
        new Vector3(0, 100, 0),
        scene
      );
      light.intensity = 0.9;

      // Create a ground Plane
      const plane = MeshBuilder.CreatePlane("plane", { size: 50 }, scene);
      plane.rotate(new Vector3(1, 0, 0), Math.PI / 2);

      // Import the car mesh
      // let car: AbstractMesh | null = null;
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
      };

      importCar();

      // Handle keyboard inputs for car control
      let inputMap: { [key: string]: boolean } = {};
      scene.actionManager = new ActionManager(scene);
      scene.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
          inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
        })
      );
      scene.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
          inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
        })
      );

      scene.onBeforeRenderObservable.add(() => {
        let keydown = false;
        const speed = 0.5;
        const rotationSpeed = 0.05;
        if (inputMap["w"]) {
          const forward = car?.getDirection(Vector3.Forward());
          car?.moveWithCollisions(car?.right.scaleInPlace(-speed));
          keydown = true;
        }
        if (inputMap["s"]) {
          const backward = car?.getDirection(Vector3.Forward()).scale(-1);
          car?.moveWithCollisions(car?.right.scaleInPlace(speed));
          keydown = true;
        }
        if (inputMap["a"]) {
          car?.rotate(Vector3.Up(), -rotationSpeed);
          keydown = true;
        }
        if (inputMap["d"]) {
          car?.rotate(Vector3.Up(), rotationSpeed);
          keydown = true;
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
