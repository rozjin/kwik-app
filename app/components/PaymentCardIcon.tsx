import Image from "next/image";
import React, { useState } from "react";

export default React.forwardRef<
  HTMLImageElement,
  { type: string, size?: number, className?: string }
>(({ type, size = 16, className }, ref) => {  
  const [ error, setError ] = useState(false);
  const src = `/icons/cards/${type}.svg`;
  const fallback = '/icons/cards/generic.svg';

  return (
    <Image
      priority
      alt="Payment Card Icon"
      onError={() => setError(true)}
      src={error ? fallback : src}

      ref={ref}

      height={size}
      width={size}

      className={className}
    />
  )
});