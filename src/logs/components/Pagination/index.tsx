import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStepBackward,
  faStepForward,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.module.css";

interface IPaginationProps {
  totalRowCount: number;
  rowCount: number;
  currentPage: number;
  loading?: boolean;
  onPageChange: () => void;
  onNextPage: () => void;
  onNavigateTofirstPage: () => void;
  onNavigationToLastPage: () => void;
}

const Pagination = (props: IPaginationProps) => {
  const {
    totalRowCount,
    currentPage,
    loading: loaded,
    onPageChange,
    onNextPage,
    onNavigateTofirstPage,
    onNavigationToLastPage,
  } = props;

  const totalPages = Math.ceil(totalRowCount / 10);

  const [, setClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleActionWithClickCount = (
    action: () => void,
    doubleClickAction: () => void
  ) => {
    return () => {
      setClickCount((prevClickCount: number) => {
        if (prevClickCount === 0) {
          clickTimerRef.current = setTimeout(() => {
            action();
            setClickCount(0);
          }, 250);
        } else if (prevClickCount === 1) {
          clearTimeout(clickTimerRef.current as NodeJS.Timeout);
          doubleClickAction();
          setClickCount(0);
        }
        return prevClickCount + 1;
      });
    };
  };

  const handlePreviousPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      onPageChange();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) onNextPage();
  };

  const handlePreviousClick = handleActionWithClickCount(
    () => handlePreviousPage(currentPage - 1),
    onNavigateTofirstPage
  );

  const handleNextClick = handleActionWithClickCount(
    handleNextPage,
    onNavigationToLastPage
  );

  return (
    <div className={styles.navigationWrapper}>
      <span onClick={handlePreviousClick}>
        <FontAwesomeIcon icon={faStepBackward} />
      </span>
      &nbsp;
      <span>
        Showing <strong>{currentPage + 1}</strong> of&nbsp;
        <strong>{loaded ? "?" : totalPages}</strong>
      </span>
      &nbsp;&nbsp;
      <span onClick={handleNextClick}>
        <FontAwesomeIcon icon={faStepForward} />
      </span>
    </div>
  );
};

export default Pagination;
