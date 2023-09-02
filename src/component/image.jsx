import React, { useEffect, useState } from "react";

const Image = ({ fileName, blob }) => {
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      setImageSrc(reader.result);
    };
  }, [blob]);

  return <img src={imageSrc} alt={fileName} />;
};

export default Image;
