import React from "react";
import { classnames } from "../utils/general";

const CustomInput = ({ customInput, setCustomInput }) => {
  return (
    <>
      {" "}
      {/* <h1 className="font-bold text-center text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 ">
        Input
      </h1> */}
      <textarea
        rows="5"
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        placeholder={`Custom input`}
        className={classnames(
          "focus:outline-none w-full border-2 border-black z-10 rounded-md  px-4 py-2 mt-2"
        )}
      ></textarea>
    </>
  );
};

export default CustomInput;
