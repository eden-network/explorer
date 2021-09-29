/* eslint-disable react/button-has-type */

import { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';

interface ClipboardButtonProps {
  className?: string;
  copyText?: string;
}

export default function ClipboardButton({
  className,
  copyText,
}: ClipboardButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  // This is the function we wrote earlier
  async function copyTextToClipboard(text) {
    if ('clipboard' in navigator) {
      return navigator.clipboard.writeText(text);
    }
    return document.execCommand('copy', true, text);
  }

  // onClick handler function for the copy button
  const handleCopyClick = () => {
    // Asynchronously call copyTextToClipboard
    copyTextToClipboard(copyText)
      .then(() => {
        // If successful, update the isCopied state value
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <button
      className={cx(
        className,
        'betterhover:hover:text-green cursor-pointer select-none'
      )}
      onClick={handleCopyClick}
    >
      {isCopied && (
        <span className="rounded shadow-lg px-2 py-1 bg-white text-blue text-xs -mt-5 -mx-5  absolute">
          Copied
        </span>
      )}
      <FontAwesomeIcon icon="clipboard" size="sm" />
    </button>
  );
}
