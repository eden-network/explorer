import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

export const displayIcon = (type) => {
  switch (type) {
    case 'success':
      return <FontAwesomeIcon icon="check-circle" />;
    case 'info':
      return <FontAwesomeIcon icon="info-circle" />;
    case 'error':
      return <FontAwesomeIcon icon="exclamation-triangle" />;
    case 'warning':
      return <FontAwesomeIcon icon="exclamation-circle" />;
    default:
      return <FontAwesomeIcon icon="exclamation-triangle" />;
  }
};

interface ToastMessageProps {
  message: string;
  type: string;
}

const ToastMessage = ({ type, message }: ToastMessageProps) =>
  toast[type](
    <div className="flex white items-center">
      <div className="font-normal pl-2 pt-0 flex-shrink-0 text-center text-white">
        {displayIcon(type)}
      </div>
      <div className="flex-1 font-normal px-4 text-sm text-white">
        {message}
      </div>
    </div>,
    { className: 'bg-alert-red' }
  );

ToastMessage.dismiss = toast.dismiss;

export default ToastMessage;
