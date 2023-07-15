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
      const plane = MeshBuilder.CreatePlane("plane", { size: 50 }, scene);
      plane.rotate(new Vector3(1, 0, 0), Math.PI / 2);
      const groundMat = new StandardMaterial("ground", scene);
      groundMat.diffuseColor = new Color3(0.3, 0.3, 0.3);
      plane.material = groundMat;

      // Import the car mesh
      // let car: AbstractMesh | null = null;
      let car: AbstractMesh | null = null;
      let tyreL1: AbstractMesh | null = null;
      let tyreL2: AbstractMesh | null = null;
      let tyreR1: AbstractMesh | null = null;
      let tyreR2: AbstractMesh | null = null;

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
        tyreL1 = result.meshes[6];
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
        let animating = false;
        let keydown = false;
        const fspeed = 0.2;
        const rotationSpeed = 0.05;
        let rot = Math.PI / 2;
        if (inputMap["w"]) {
          car?.moveWithCollisions(car?.right.scaleInPlace(-fspeed));
          keydown = true;
        }
        if (inputMap["s"]) {
          car?.moveWithCollisions(car?.right.scaleInPlace(fspeed));
          keydown = true;
        }
        if (inputMap["a"]) {
          if (inputMap["s"]) {
            car?.rotate(Vector3.Up(), rotationSpeed);
            keydown = true;
          } else {
            car?.rotate(Vector3.Up(), -rotationSpeed);
            keydown = true;
          }
        }
        if (inputMap["d"]) {
          if (inputMap["s"]) {
            car?.rotate(Vector3.Up(), -rotationSpeed);
            keydown = true;
          } else {
            car?.rotate(Vector3.Up(), rotationSpeed);
            keydown = true;
          }
          // tyreL1?.rotate(new Vector3(0, 0, 1), Math.PI / 3);
        }

        if (keydown) {
          if (!animating) {
            animating = true;
            if (inputMap["q"]) {
              tyreL1?.rotate(Vector3.Up(), rot);
              tyreL2?.rotate(Vector3.Up(), rot);
              tyreR1?.rotate(Vector3.Up(), rot);
              tyreR2?.rotate(Vector3.Up(), rot);
              rot += 10;
            }
          }
        } else if (animating) {
          animating = false;
        }
      });
      // The following can be used to control the camera using arrow keys
      // if (inputMap["w"] || inputMap["ArrowUp"]) {
      //   if (inputMap["s"] || inputMap["ArrowDown"]) {
      //   if (inputMap["a"] || inputMap["ArrowLeft"]) {
      //   if (inputMap["d"] || inputMap["ArrowRight"]) {

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
      camera.attachControl(scene);

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
