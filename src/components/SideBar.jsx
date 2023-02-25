import React, { useState, useEffect } from "react";
import { memo } from "react";

const SideBar = ({ folderTree, fileData }) => {
  return (
    <>
      <div
        className={`bg-blue-500  pl-8 pr-16 py-5 text-white w-52 h-full z-40 rounded-md `}
      >
        {folderTree &&
          Object.entries(folderTree).map(([folderName = key, value]) => (
            <div key={folderName}>
              <span className="text-lg font-normal">{folderName}</span>
              <ul className="pl-3">
                {[...value.keys()].map((fileName) => (
                  <li
                    onClick={() => {
                      fileData(fileName, folderName, "load");
                    }}
                    key={fileName}
                  >
                    <div className="flex justify-between hover:bg-blue-400 hover:rounded-sm text-base">
                      <span className="px-1">{fileName}</span>
                      <button
                        className="hover:bg-red-500 rounded-sm  text-base"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileData(fileName, folderName, "delete");
                        }}
                      >
                        x
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </>
  );
};

export default memo(SideBar);
