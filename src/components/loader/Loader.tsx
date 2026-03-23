import clsx from "clsx";

type LoaderProps = {
  center?: boolean;
  fullScreen?: boolean;
  className?: string;
};

const Loader = ({ center, fullScreen, className }: LoaderProps) => {
  if (fullScreen) {
    return <div className="loader top-[50%] left-[55%]" />;
  }

  if (center) {
    return <div className="loader top-[50%] left-[65%]" />;
  }

  return <div className={clsx("loader", className)} />;
};

export default Loader;
