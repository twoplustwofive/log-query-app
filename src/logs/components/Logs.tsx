import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ColDef } from "ag-grid-community";
import { Log } from "../util";
import Pagination from "./Pagination";
import { useGetLogsCountMutation, useGetLogsMutation } from "../api/logs";
import QueryBuilder, {
  Field,
  Option,
  RuleGroupType,
  defaultOperators,
} from "react-querybuilder";
import "react-querybuilder/dist/query-builder.css";

const initialFilters = {
  level: "",
  message: "",
  resourceId: "",
  startTime: null,
  endTime: null,
  traceId: "",
  spanId: "",
  commit: "",
  parentResourceId: "",
};

const fields: Field[] = Object.keys(initialFilters).map((key) => ({
  name: key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
  operators: key.includes("Time")
    ? [{ name: "equal", label: "=" } as Option<string>]
    : defaultOperators.filter(
        (operator) =>
          operator.name != "in" &&
          operator.name != "notIn" &&
          operator.name != "between" &&
          operator.name != "notBetween"
      ),
  inputType: key.includes("Time") ? "date" : "text",
}));

const initialQuery: RuleGroupType = {
  combinator: "and",
  rules: [],
};

const LogsComponent = () => {
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [totalLogsCount, setTotalLogsCount] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsCountLoading, setLogsCountLoading] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [query, setQuery] = useState(initialQuery);

  const [getLogsAPI] = useGetLogsMutation();
  const [getLogsCountAPI] = useGetLogsCountMutation();

  const pageCount = 10;
  const totalPages = Math.ceil(totalLogsCount / pageCount);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    fetchLogsCount();
  }, []);

  const fetchLogs = async () => {
    setLogsLoading(true);

    try {
      const logsData = await getLogsAPI(serializeQuery(query)).unwrap();
      setLogs(logsData);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchLogsCount = async () => {
    setLogsCountLoading(true);

    try {
      const countData = await getLogsCountAPI(serializeQuery(query)).unwrap();
      setTotalLogsCount(countData || 0);
    } catch (error) {
      console.error("Error fetching logs count:", error);
    } finally {
      setLogsCountLoading(false);
    }
  };

  const columnDefs: ColDef<Log, any>[] = [
    { headerName: "Level", field: "level", flex: 1 },
    { headerName: "Message", field: "message", flex: 1 },
    { headerName: "Resource Id", field: "resourceId", flex: 1 },
    { headerName: "Timestamp", field: "timestamp", flex: 1 },
    { headerName: "Trace Id", field: "traceId", flex: 1 },
    { headerName: "Span Id", field: "spanId", flex: 1 },
    { headerName: "Commit", field: "commit", flex: 1 },
    {
      headerName: "Parent Resource Id",
      field: "metadata.parentResourceId",
      flex: 1,
    },
  ];

  const serializeQuery = (query: RuleGroupType) => {
    const queryParams = [];

    // Add combinator
    queryParams.push(`combinator=${query.combinator}`);

    // Add rules
    query.rules.forEach((rule: any) => {
      queryParams.push(
        `${rule.field}=${
          String(rule.field).includes("Time")
            ? new Date(rule.value).toISOString()
            : rule.value
        }`
      );
      queryParams.push(`${rule.field}Operator=${rule.operator}`);
    });

    queryParams.push(`pageNumber=${currentPageNumber}`);
    queryParams.push(`pageCount=${pageCount}`);

    // Join all parameters with "&"
    return queryParams.join("&");
  };

  const handleNextPage = () => {
    setCurrentPageNumber(currentPageNumber + 1);
    fetchLogs();
    fetchLogsCount();
  };

  const handleOnPageChange = () => {
    setCurrentPageNumber(currentPageNumber - 1);
    fetchLogs();
    fetchLogsCount();
  };

  const handleNavigationToFirstPage = () => {
    if (currentPageNumber !== 1) {
      setCurrentPageNumber(1);
      fetchLogs();
      fetchLogsCount();
    }
  };

  const handleNavigationToLastPage = () => {
    if (currentPageNumber !== totalPages) {
      setCurrentPageNumber(totalPages);
      fetchLogs();
      fetchLogsCount();
    }
  };

  const handleApplyFilters = () => {
    fetchLogs();
    fetchLogsCount();
  };

  return (
    <div>
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}
      >
        <h2 style={{ marginRight: "20px" }}>Advanced Filters</h2>
        <div style={{ marginBottom: "10px", marginRight: "10px" }}>
          <QueryBuilder
            fields={fields}
            query={query}
            onQueryChange={(query) => setQuery(query)}
            controlElements={{
              addGroupAction: () => null,
            }}
          />
        </div>
        <button onClick={handleApplyFilters}>Apply Filters</button>
      </div>

      <div
        className="ag-theme-alpine"
        style={{ height: "400px", width: "100%" }}
      >
        <AgGridReact
          rowData={logs}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          suppressHorizontalScroll={false}
        />
      </div>
      <div
        style={{
          marginTop: "80px",
          display: "flex",
          justifyContent: "space-between",
          marginLeft: "30px",
          marginRight: "30px",
        }}
      >
        <div>
          <h4>Total available logs: {totalLogsCount}</h4>
          <h4>Page size: {pageCount}</h4>
        </div>
        <Pagination
          totalRowCount={totalLogsCount || 0}
          rowCount={logs?.length || 0}
          currentPage={currentPageNumber - 1}
          onPageChange={handleOnPageChange}
          onNextPage={handleNextPage}
          onNavigateTofirstPage={handleNavigationToFirstPage}
          onNavigationToLastPage={handleNavigationToLastPage}
          loading={logsCountLoading || logsLoading}
        />
      </div>
    </div>
  );
};

export default LogsComponent;
