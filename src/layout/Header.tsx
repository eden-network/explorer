import { useCallback, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import logo from '../../public/logo.svg';
import Search from '../components/Search';
import { validate as addressValidator } from '../modules/validator/address';
import { validate as blockValidator } from '../modules/validator/block';
import { validate as ensValidator } from '../modules/validator/ens';

const selectedButton =
  'bg-blue-light text-white px-3 py-2 rounded-md text-sm font-medium';
const unselectedButton =
  'text-gray-300 hover:bg-green hover:text-blue px-3 py-2 rounded-md text-sm font-medium';

export default function Header() {
  const router = useRouter();

  const [value, setValue] = useState('');
  const [inputError, setInputError] = useState(false);

  const search = useCallback(() => {
    if (!value) return;
    const keyWord = value.replaceAll(',', '').trim();
    if (addressValidator(keyWord)) {
      router.push(`/address/${keyWord}`);
    } else if (blockValidator(keyWord)) {
      router.push(`/block/${parseInt(keyWord, 10)}`);
    } else if (ensValidator(keyWord)) {
      router.push(`/address/${keyWord.toLocaleLowerCase()}`);
    } else {
      setInputError(true);
    }
  }, [router, value]);

  const handleChange = useCallback((_v) => {
    setValue(_v);
    setInputError(false);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      search();
    }
  };

  return (
    <nav className="bg-blue shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="items-center sm:flex sm:justify-between">
          <div className="flex pt-3 sm:pt-0 items-center px-2 lg:px-0">
            <div className="flex-shrink-0">
              <Link href="/">
                <a>
                  <Image src={logo} width={103} alt={logo} />
                </a>
              </Link>
            </div>
            <div className="ml-6 lg:block lg:ml-6">
              <div className="flex space-x-4">
                <Link href="/stakers?page=1">
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
          <div className="min-w-0 flex-1 md:px-8 lg:px-0 xl:col-span-6 lg:ml-6">
            <div className="flex items-center px-2 pt-3 pb-6 md:max-w-3xl md:mx-auto sm:px-6 sm:py-4 lg:max-w-none lg:mx-0 xl:px-0">
              <Search
                value={value}
                prompt="Search by ENS, address, or block"
                handleChange={handleChange}
                handleKeyDown={handleKeyDown}
                error={inputError}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
