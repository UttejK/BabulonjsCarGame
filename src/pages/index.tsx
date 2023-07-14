import React, { FC } from "react";
import type { HeadFC, PageProps } from "gatsby";
import BabylonScene from "../components/BabylonScene";

const IndexPage: FC<PageProps> = () => {
  return (
    <>
      <div>
        <BabylonScene />
      </div>
    </>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>CAR GAME | BabylonJS Demo</title>;
