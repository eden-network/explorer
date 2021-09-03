import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import logo from '../public/logo.svg';

const selectedButton =
  'bg-blue-light text-white px-3 py-2 rounded-md text-sm font-medium';
const unselectedButton =
  'text-gray-300 hover:bg-green hover:text-blue px-3 py-2 rounded-md text-sm font-medium';

export default function Header() {
  const router = useRouter();

  return (
    <nav className="bg-blue shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center px-2 lg:px-0">
            <div className="flex-shrink-0">
              <Link href="/">
                <a>
                  <Image src={logo} width={103} alt={logo} />
                </a>
              </Link>
            </div>
            <div className="lg:block lg:ml-6">
              <div className="flex space-x-4">
                <Link href="/stakers">
                  <a
                    className={
                      router.route === '/stakers'
                        ? selectedButton
                        : unselectedButton
                    }
                  >
                    Stakers
                  </a>
                </Link>
                <Link href="/blocks">
                  <a
                    className={
                      router.route === '/blocks'
                        ? selectedButton
                        : unselectedButton
                    }
                  >
                    Blocks
                  </a>
                </Link>
                {/* <Link href="/slots"><a className={router.route === '/slots' ? selectedButton : unselectedButton}>Slots</a></Link> */}
                {/* <Link href="/producers"><a className={router.route === '/producers' ? selectedButton : unselectedButton}>Producers</a></Link> */}
              </div>
            </div>
          </div>
          {/* <div className="min-w-0 flex-1 md:px-8 lg:px-0 xl:col-span-6 lg:ml-6">
            <div className="flex items-center px-6 py-4 md:max-w-3xl md:mx-auto lg:max-w-none lg:mx-0 xl:px-0">
              <Search prompt="Search by address, transaction, or block" />
            </div>
          </div> */}
        </div>
      </div>
    </nav>
  );
}
