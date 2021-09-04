import { ReactNode } from 'react';

type IMainProps = {
  meta: ReactNode;
  children?: ReactNode;
};

export default function Shell(props: IMainProps) {
  return (
    <div className="min-h-screen bg-blue-light">
      {props.meta}
      <div className="py-10 text-white">
        <main>{props.children}</main>
      </div>
    </div>
  );
}
