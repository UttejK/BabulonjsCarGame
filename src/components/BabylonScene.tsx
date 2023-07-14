import React, { useEffect, useState, useRef } from "react";

import {
  Color4,
  Color3,
  Vector3,
  MeshBuilder,
  Engine,
  Scene,
  HemisphericLight,
  ArcRotateCamera,
} from "@babylonjs/core";

interface CanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Canvas: React.FC<CanvasProps> = ({ canvasRef }) => {
  return <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh" }} />;
};

const BabylonScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const engine = new Engine(canvasRef.current, true);
      const scene = new Scene(engine);

      // Set the background color to white
      scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

      // Create a hemispheric light to illuminate the scene
      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

      // Create a camera
      const camera = new ArcRotateCamera(
        "camera",
        0,
        0,
        10,
        new Vector3(0, 2, 0),
        scene
      );

      // Attach control to camera
      camera.attachControl();

      // Create a plane
      const plane = MeshBuilder.CreatePlane("plane", { size: 10 }, scene);
      plane.position = new Vector3(0, 0, 0);
      plane.outlineColor = new Color3(1, 0, 0);

      engine.runRenderLoop(() => {
        scene.render();
      });

      return () => {
        engine.stopRenderLoop();
        scene.dispose();
      };
    }
  }, []);

  return <Canvas canvasRef={canvasRef} />;
};

export default BabylonScene;
