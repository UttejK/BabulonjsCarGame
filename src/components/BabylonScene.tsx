import React, { useEffect, useRef, useState } from "react";
import {
  Engine,
  Scene,
  HemisphericLight,
  Color3,
  Color4,
  Vector3,
  ArcRotateCamera,
  UniversalCamera,
  SceneLoader,
  MeshBuilder,
  AbstractMesh,
  ActionManager,
  ExecuteCodeAction,
  StandardMaterial,
} from "@babylonjs/core";
import "@babylonjs/loaders";

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
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
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

      // // Create a ground Plane
      // const plane = MeshBuilder.CreatePlane(
      //   "plane",
      //   { height: 100, width: 100 },
      //   scene
      // );
      // plane.rotate(new Vector3(1, 0, 0), Math.PI / 2);
      // const groundMat = new StandardMaterial("ground", scene);
      // groundMat.diffuseColor = new Color3(0.3, 0.3, 0.3);
      // plane.material = groundMat;

      // Import the car mesh
      let car: AbstractMesh | null = null;
      let tireL1: AbstractMesh | null = null;
      let tireL2: AbstractMesh | null = null;
      let tireR1: AbstractMesh | null = null;
      let tireR2: AbstractMesh | null = null;
      let tireL3: AbstractMesh | null = null;
      let tireL4: AbstractMesh | null = null;
      let tireR3: AbstractMesh | null = null;
      let tireR4: AbstractMesh | null = null;

      const importCar = async () => {
        const result = await SceneLoader.ImportMeshAsync(
          "",
          "https://raw.githubusercontent.com/UttejK/BabulonjsCarGame/main/public/",
          "Car.glb",
          scene,
          undefined,
          ".glb"
        );
        car = result.meshes[0]; // Values from 6 are for the tyres
        tireL1 = result.meshes[6];
        tireL2 = result.meshes[7];
        tireR1 = result.meshes[8];
        tireR2 = result.meshes[9];
        tireL3 = result.meshes[6];
        tireL4 = result.meshes[7];
        tireR3 = result.meshes[8];
        tireR4 = result.meshes[9];
      };

      importCar();

      // Import the city
      let city: AbstractMesh | null = null;
      const importCity = async () => {
        const result = await SceneLoader.ImportMeshAsync(
          "",
          "/",
          "city.glb",
          scene,
          undefined,
          ".glb"
        );
        city = result.meshes[0];
        city.scaling = new Vector3(5, 5, 5);

        if (car?.position) {
          camera.position = car?.position;
        }
      };

      importCity();

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

        // Rotate the tires when the car is moving
        if (speed !== 0) {
          const tireRotationSpeed = 0.1; // Rotation speed of tires
          tireL1?.rotate(Vector3.Up(), tireRotationSpeed);
          tireL2?.rotate(Vector3.Up(), tireRotationSpeed);
          tireR1?.rotate(Vector3.Up(), tireRotationSpeed);
          tireR2?.rotate(Vector3.Up(), tireRotationSpeed);
          tireL3?.rotate(Vector3.Up(), tireRotationSpeed);
          tireL4?.rotate(Vector3.Up(), tireRotationSpeed);
          tireR3?.rotate(Vector3.Up(), tireRotationSpeed);
          tireR4?.rotate(Vector3.Up(), tireRotationSpeed);
        } else {
          // Reset tire rotation when the car is not moving
          tireL1?.rotation.set(0, 0, 0);
          tireL2?.rotation.set(0, 0, 0);
          tireR1?.rotation.set(0, 0, 0);
          tireR2?.rotation.set(0, 0, 0);
          tireL3?.rotation.set(0, 0, 0);
          tireL4?.rotation.set(0, 0, 0);
          tireR3?.rotation.set(0, 0, 0);
          tireR4?.rotation.set(0, 0, 0);
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
