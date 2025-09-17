import React from "react";
import { useSelector } from "react-redux";
const Loader = () => {
  const loading = useSelector((state) => state.loader.loading);

  if (!loading) return null;
  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
