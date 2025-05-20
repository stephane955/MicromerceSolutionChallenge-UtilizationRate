import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { useMemo, useState, useEffect } from "react";
import sourceData from "./source-data.json";
import type { SourceDataType, TableDataType } from "./types";
import Papa from 'papaparse';
import { saveAs } from "file-saver";


/**
 * Example of how a tableData object should be structured.
 *
 * Each `row` object has the following properties:
 * @prop {string} person - The full name of the employee.
 * @prop {number} past12Months - The value for the past 12 months.
 * @prop {number} y2d - The year-to-date value.
 * @prop {number} may - The value for May.
 * @prop {number} june - The value for June.
 * @prop {number} july - The value for July.
 * @prop {number} netEarningsPrevMonth - The net earnings for the previous month.
 */

// Utility: parse string as number
const parseUtil = (val?: string) =>
    val !== undefined ? parseFloat(val) : undefined;

// Utility: extract month from utilisation data
const getMonthUtil = (util: any, month: string) =>
    parseUtil(
        util?.lastThreeMonthsIndividually?.find((m: any) => m.month === month)
            ?.utilisationRate
    );

// CSV export function
const handleExport = (data: TableDataType[]) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "workforce-dashboard.csv");
};

const Example = () => {
    const [loading, setLoading] = useState(true);
    const [tableData, setTableData] = useState<TableDataType[]>([]);

    // Simulate loading
    useEffect(() => {
        const loadData = () => {
            const data: TableDataType[] = (
                sourceData as unknown as SourceDataType[]
            )
                .filter(
                    (row) =>
                        row.employees?.status === "active" ||
                        row.externals?.status === "active"
                )
                .map((row) => {
                    const personData = row.employees ?? row.externals;
                    const util = personData?.workforceUtilisation;
                    const name =
                        personData?.jobType === "external"
                            ? `External ${personData.firstname} ${personData.lastname ?? ""}`
                            : `${personData.firstname} ${personData.lastname ?? ""}`;

                    return {
                        person: name,
                        past12Months: parseUtil(util?.utilisationRateLastTwelveMonths),
                        y2d: parseUtil(util?.utilisationRateYearToDate),
                        may: getMonthUtil(util, "May"),
                        june: getMonthUtil(util, "June"),
                        july: getMonthUtil(util, "July"),
                        netEarningsPrevMonth: parseUtil(util?.monthlyCostDifference) ?? 0,
                    };
                });
            setTableData(data);
            setLoading(false);
        };

        setTimeout(loadData, 1000); // simulate delay
    }, []);

    const columns = useMemo<MRT_ColumnDef<TableDataType>[]>(() => [
        {
            accessorKey: "person",
            header: "Person",
            enableSorting: true,
        },
        {
            accessorKey: "past12Months",
            header: "Past 12 Months",
            enableSorting: true,
            Cell: ({ cell }) =>
                cell.getValue<number | undefined>() != null
                    ? `${(cell.getValue<number>() * 100).toFixed(0)}%`
                    : "-",
        },
        {
            accessorKey: "y2d",
            header: "Y2D",
            enableSorting: true,
            Cell: ({ cell }) =>
                cell.getValue<number | undefined>() != null
                    ? `${(cell.getValue<number>() * 100).toFixed(0)}%`
                    : "-",
        },
        {
            accessorKey: "may",
            header: "May",
            enableSorting: true,
            Cell: ({ cell }) =>
                cell.getValue<number | undefined>() != null
                    ? `${(cell.getValue<number>() * 100).toFixed(0)}%`
                    : "-",
        },
        {
            accessorKey: "june",
            header: "June",
            enableSorting: true,
            Cell: ({ cell }) =>
                cell.getValue<number | undefined>() != null
                    ? `${(cell.getValue<number>() * 100).toFixed(0)}%`
                    : "-",
        },
        {
            accessorKey: "july",
            header: "July",
            enableSorting: true,
            Cell: ({ cell }) =>
                cell.getValue<number | undefined>() != null
                    ? `${(cell.getValue<number>() * 100).toFixed(0)}%`
                    : "-",
        },
        {
            accessorKey: "netEarningsPrevMonth",
            header: "Net Earnings Prev Month",
            enableSorting: true,
            Cell: ({ cell }) => {
                const value = cell.getValue<number>();
                const formatted = new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                }).format(value);
                return (
                    <span style={{ color: value >= 0 ? "green" : "red" }}>{formatted}</span>
                );
            },
        },
    ], []);

    const table = useMaterialReactTable({
        columns,
        data: tableData,
        enableStickyHeader: true,
        initialState: {
            density: "compact",
        },
        state: {
            isLoading: loading,
        },
    });

    return (
        <div style={{ padding: "1rem" }}>
            <h2>💼 Workforce Management Dashboard</h2>
            <button
                onClick={() => handleExport(tableData)}
                style={{
                    marginBottom: "1rem",
                    background: "#1976d2",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                }}
                disabled={loading}
            >
                Export CSV
            </button>
            <MaterialReactTable table={table} />
        </div>
    );
};

export default Example;

