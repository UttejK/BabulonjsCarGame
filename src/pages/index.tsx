import React, { FC } from "react";
import type { HeadFC, PageProps } from "gatsby";
import BabylonScene from "../components/BabylonScene";

const IndexPage: FC<PageProps> = () => {
  return (
    <>
      <div>
        <div className="fixed w-full flex flex-row-reverse gap-4 bottom-0 mb-4 ml-4 items-center justify-between">
          <button
            className="bg-gray-50/10 hover:bg-gray-300 font-semibold p-4 rounded-2xl mr-8"
            onClick={() => {
              alert("You can use the W A S D Keys to move around the scene");
            }}
          >
            <h3>Help?</h3>
          </button>
          <a
            href="https://github.com/UttejK/BabulonjsCarGame"
            className="bg-gray-50/10 hover:bg-gray-300 font-semibold p-4 mr-8 rounded-2xl"
          >
            <h3>Github</h3>
          </a>
        </div>
        <BabylonScene />
      </div>
    </>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>CAR GAME | BabylonJS Demo</title>;
