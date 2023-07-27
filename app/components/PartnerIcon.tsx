import Image from "next/image";
import React, { useState } from "react";

export default React.forwardRef<
  HTMLImageElement,
  { src: string, size?: number, className?: string }
>(({ src, size = 16, className }, ref) => {  
  return (
    <Image
      priority
      alt="Payment Card Icon"
      src={src}

      ref={ref}

      height={size}
      width={size}

      className={className}
    />
  )
});