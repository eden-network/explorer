import { ReactNode } from 'react';

type IMainProps = {
  meta: ReactNode;
  children?: ReactNode;
};

export default function Shell(props: IMainProps) {
  return (
    <div className="min-h-screen bg-blue-light">
      {props.meta}
      <div className="pt-6 pb-10 text-white">
        <main>{props.children}</main>
      </div>
    </div>
  );
}
