import { ReactNode } from 'react';

import Header from '../components/Header';

type IMainProps = {
  meta: ReactNode;
  children?: ReactNode;
};

export default function Shell(props: IMainProps) {
  return (
    <div className="min-h-screen bg-blue-light">
      {props.meta}
      <Header />
      <div className="py-10 text-white">
        <main>{props.children}</main>
      </div>
    </div>
  );
}
