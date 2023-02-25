import React, { useEffect, useState, useContext, memo } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "../utils/general";
import { languageOptions } from "../constants/languageOptions";
import { useSnackbar } from "notistack";
import { defineTheme } from "../lib/defineTheme";
import useKeyPress from "../hooks/useKeyPress";
import OutputWindow from "./OutputWindow";
import CustomInput from "./CustomInput";
import OutputDetails from "./OutputDetails";
import ThemeDropdown from "./ThemeDropdown";
import LanguagesDropdown from "./LanguagesDropdown";
import { supabase } from "../lib/Store";
import UserContext from "../lib/UserContext";
import SideBar from "./SideBar";
import { useRef } from "react";
const javascriptDefault = `console.log("Hi");`;

const Landing = () => {
  console.count("Landing");
  const { enqueueSnackbar } = useSnackbar();
  const [showSidebar, setShowSidebar] = useState(false);
  const { signOut, user } = useContext(UserContext);
  const [code, setCode] = useState(javascriptDefault);
  const [CodeFromFile, setCodeFromFile] = useState("");
  const [folderTree, setFolderTree] = useState({});
  const [fileInfo, setFileInfo] = useState({
    file_name: "starterFile",
    folder_name: "root",
  });
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [theme, setTheme] = useState("cobalt");
  const [language, setLanguage] = useState(languageOptions[0]);
  const ref = useRef(false);
  useEffect(() => {
    // avoids calling the API on every render
    console.count("useef");
    if (ref.current) {
      getBucket();
      getCode();
      defineTheme("oceanic-next").then((_) =>
        setTheme({ value: "oceanic-next", label: "Oceanic Next" })
      );
    }
    return () => {
      ref.current = true;
    };
  }, []);
  const getBucket = async () => {
    const { data, error } = await supabase.storage
      .from("file-store")
      .list("images");
  };

  const setFolders = async (user_id, folder_name, file_name, file_data) => {
    const { data, error } = await supabase
      .from("folders")
      .insert([{ user_id, folder_name, file_name, file_data }]);
  };
  const getFile = async (folder_name, file_name) => {
    const { data, error } = await supabase
      .from("folders")
      .insert([{ folder_name, file_name }]);
  };
  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");

  const onSelectChange = (sl) => {
    console.log("selected Option...", sl);
    setLanguage(sl);
  };
  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress);
      console.log("ctrlPress", ctrlPress);
      handleCompile();
    }
  }, [ctrlPress, enterPress]);

  const onChange = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };
  async function getCode() {
    const { data, error } = await supabase.from("folders").select("*");
    if (!error) {
      //let str = String(window.atob(data[3].file_data));
      //setCodeFromFile(str);
      setFoldersAndFiles(data);
    }
  }
  const setFoldersAndFiles = (list) => {
    let tree = {};
    list.forEach((item) => {
      if (tree[item.folder_name]) {
        tree[item.folder_name].set(item.file_name, item.file_data);
      } else {
        tree[item.folder_name] = new Map();
        tree[item.folder_name].set(item.file_name, item.file_data);
      }
    });
    setFolderTree(tree);
  };

  const fileData = (file_name, folder_name, action) => {
    switch (action) {
      case "load":
        let file = folderTree[folder_name].get(file_name);
        setCodeFromFile(window.atob(file));
        setFileInfo({ file_name, folder_name });
        break;
      case "save":
        setFolderTree((tree) => {
          tree[folder_name].set(file_name, window.btoa(code));
          return tree;
        });
        break;
      case "delete":
        setFolderTree((tree) => {
          tree[folder_name].delete(file_name);
          return tree;
        });
        break;
      default:
        enqueueSnackbar("Invalid operation", { variant: "error" });
        break;
    }
  };
  const saveFile = (code) => {
    let file_name, folder_name;
    if (confirm("Create New File || Cancel to save on same File")) {
      file_name = window.prompt("Enter the new file name");
      folder_name = window.prompt("Enter the Folder name");
      //default to root folder
      console.log(file_name, "root", code);
    } else {
      folder_name = fileInfo.folder_name;
      file_name = fileInfo.file_name;
    }
    if (file_name && folder_name) {
      setFolderTree((folderTree) => {
        let newTree = { ...folderTree };
        newTree[folder_name].set(file_name, code);
        return newTree;
      });
      setFolders(user.id, folder_name, file_name, code);
      enqueueSnackbar("File saved", { variant: "success" });
    }
  };
  const handleCompile = () => {
    setProcessing(true);
    const formData = {
      language_id: language.id,
      // encode source code in base64
      source_code: window.btoa(code),
      stdin: window.btoa(customInput),
    };
    const options = {
      method: "POST",
      url: import.meta.env.VITE_RAPID_API_URL,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": import.meta.env.VITE_RAPID_API_HOST,
        "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
      },
      data: formData,
    };
    axios
      .request(options)
      .then(function (response) {
        const token = response.data.token;
        checkStatus(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        // get error status
        let status = err?.response?.status;
        console.log("error", err);
        if (status === 429) {
          console.log("too many requests", status);
          enqueueSnackbar(`Quota of 50 requests exceeded for the Day!`, {
            variant: "error",
            autoHideDuration: 10000,
          });
        }
        setProcessing(false);
        console.log("catch block...", error);
      });
  };

  const checkStatus = async (token) => {
    const options = {
      method: "GET",
      url: import.meta.env.VITE_RAPID_API_URL + "/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": import.meta.env.VITE_RAPID_API_HOST,
        "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
      },
    };
    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      // Processed - we have a result
      if (statusId === 1 || statusId === 2) {
        // still processing
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
        return;
      } else {
        setProcessing(false);
        setOutputDetails(response.data);
        enqueueSnackbar(`Compiled Successfully!`, { variant: "success" });
        console.log("response.data", response.data);
        return;
      }
    } catch (err) {
      console.log("err", err);
      setProcessing(false);
      enqueueSnackbar(``, { variant: "error" });
    }
  };

  function handleThemeChange(th) {
    const theme = th;
    console.log("theme...", theme);

    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme);
    } else {
      defineTheme(theme.value).then((_) => setTheme(theme));
    }
  }
  return (
    <>
      <div className="h-12 w-full  flex justify-end mr-6 bg-blue-400">
        <div className="flex gap-3">
          <h4 className="mt-4">
            {fileInfo &&
              "File: " + fileInfo.folder_name + "/" + fileInfo.file_name}
          </h4>
          <button
            onClick={() => {
              let base64Code = window.btoa(code);
              saveFile(base64Code);
            }}
            className="text-lg bg-white border-black border-1 hover:cursor hover:scale-105 rounded-md my-1 px-2 py-1"
          >
            Save File
          </button>
          <button
            className="text-red-500 border-1 bg-white border-black rounded-md my-1 py-1 px-2 "
            onClick={signOut}
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex space-x-4 px-2 py-2">
        <div className="flex flex-col  ">
          <h2 className="font-bold text-lg text-center py-4">Folders</h2>

          <SideBar
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            folderTree={folderTree}
            fileData={fileData}
          />
        </div>
        <div className="flex gap-2 justify-between">
          <div className="flex flex-col flex-1 w-[66vw]">
            <div className="flex flex-row justify-end ">
              <div className="px-4 py-2">
                <LanguagesDropdown onSelectChange={onSelectChange} />
              </div>
              <div className="px-4 py-2">
                <ThemeDropdown
                  handleThemeChange={handleThemeChange}
                  theme={theme}
                />
              </div>
            </div>
            <CodeEditorWindow
              code={code}
              CodeFromFile={CodeFromFile}
              onChange={onChange}
              language={language?.value}
              theme={theme.value}
            />
          </div>

          <div className="mt-[3.2rem]">
            <div className="flex flex-col mb-2">
              <CustomInput
                customInput={customInput}
                setCustomInput={setCustomInput}
              />
              <button
                onClick={handleCompile}
                disabled={!code}
                className={classnames(
                  "mt-4 border-2 border-black z-10 rounded-md  px-4 py-2 active:bg-green-500 flex-shrink-0",
                  !code ? "opacity-50" : ""
                )}
              >
                {processing ? "Processing..." : "Compile and Execute"}
              </button>
            </div>
            <OutputWindow outputDetails={outputDetails} />
            {outputDetails ||
              (outputDetails && (
                <OutputDetails outputDetails={outputDetails} />
              ))}
          </div>
        </div>
      </div>
    </>
  );
};
export default memo(Landing);
