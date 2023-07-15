import React, { useEffect, useRef, useState } from "react";
import {
  Engine,
  Scene,
  HemisphericLight,
  Color3,
  Color4,
  Vector3,
  ArcRotateCamera,
  FollowCamera,
  FollowCameraInputsManager,
  SceneLoader,
  MeshBuilder,
  AbstractMesh,
  ActionManager,
  ExecuteCodeAction,
  StandardMaterial,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { getData } from "../../.cache/page-ssr/index";
import { FollowBehavior } from "react-babylonjs";

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
      const plane = MeshBuilder.CreatePlane(
        "plane",
        { height: 100, width: 100 },
        scene
      );
      plane.rotate(new Vector3(1, 0, 0), Math.PI / 2);
      const groundMat = new StandardMaterial("ground", scene);
      groundMat.diffuseColor = new Color3(0.3, 0.3, 0.3);
      plane.material = groundMat;

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

      let speed = 0; // Car's current speed
      const acceleration = 0.005; // Acceleration rate
      const maxSpeed = 0.5; // Maximum speed

      scene.onBeforeRenderObservable.add(() => {
        let keydown = false;

        if (inputMap["w"]) {
          speed = Math.min(speed + acceleration, maxSpeed);
          car?.moveWithCollisions(car.right.scaleInPlace(-speed));
          keydown = true;
        }
        if (inputMap["s"]) {
          speed = Math.max(speed - acceleration, -maxSpeed);
          car?.moveWithCollisions(car.right.scaleInPlace(-speed));
          keydown = true;
        }
        if (
          (inputMap["a"] && inputMap["w"]) ||
          (inputMap["d"] && inputMap["s"])
        ) {
          car?.rotate(Vector3.Up(), -0.05);
          keydown = true;
        }
        if (
          (inputMap["d"] && inputMap["w"]) ||
          (inputMap["a"] && inputMap["s"])
        ) {
          car?.rotate(Vector3.Up(), 0.05);
          keydown = true;
        }

        if (!keydown) {
          // If no input, gradually slow down the car
          if (speed > 0) {
            speed = Math.max(speed - acceleration, 0);
            car?.moveWithCollisions(car.right.scaleInPlace(-speed));
          } else if (speed < 0) {
            speed = Math.min(speed + acceleration, 0);
            car?.moveWithCollisions(car.right.scaleInPlace(-speed));
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
      camera.position = new Vector3(0, 5, 10);
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
