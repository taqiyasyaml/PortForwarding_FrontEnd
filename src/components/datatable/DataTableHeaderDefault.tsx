import { Badge, Box, IconButton, Theme, Typography } from "@mui/material"
import DataTableFilterPopover, { DTSearch, DataTableFilterPopoverProps } from "./DataTableFilterPopover"
import { ArrowDownward, ArrowUpward, FilterList, ImportExport } from "@mui/icons-material"
import { useState } from 'react'
interface DataTableHeaderDefaultProps {
    name: string,
    orderable?: boolean,
    searchable?: boolean,
    orderDir?: 'asc' | 'desc',
    orderNum?: number,
    totalOrder?: number,
    toggleDir?: () => void,
    search?: DTSearch
    onChangeSearch?: (val?: DTSearch) => void,
    searchType?: Pick<DataTableFilterPopoverProps, "strSearch" | "numSearch" | "arrSearch" | "nulSearch" | "numFactor" | "numUnit">,
    filterTranslation?: DataTableFilterPopoverProps['translation'],
    isServerLoading?: boolean
}
const DataTableHeaderDefault = (props: DataTableHeaderDefaultProps) => {
    return (<>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Box
                sx={{
                    flexGrow: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...(props?.orderable === true ? { cursor: 'pointer' } : {})
                }}
                onClick={props?.orderable === true ? props?.toggleDir : undefined}
            >
                <Typography fontWeight='bold'>{props.name}</Typography>
                {props?.orderable === true && (
                    <Badge badgeContent={props?.orderNum} color="secondary" invisible={(props?.totalOrder ?? 0) < 2}>
                        {(props?.orderDir === 'desc' || props?.orderDir === 'asc') ?
                            <ArrowUpward
                                sx={{
                                    rotate: (props?.orderDir === 'desc') ? '-180deg' : '0deg',
                                    transition: (t: Theme) => t.transitions.create(['rotate'], {
                                        easing: t.transitions.easing.easeIn,
                                        duration: t.transitions.duration.standard
                                    })
                                }}
                            /> : <ImportExport sx={{ opacity: (t: Theme) => t.palette.mode === 'dark' ? 0.3 : 0.2 }} />
                        }
                    </Badge>
                )}
            </Box>
            {props?.searchable === true && (<DataTableFilterPopover
                onSearchSubmit={props?.onChangeSearch}
                search={props?.search}
                translation={props?.filterTranslation}
                isServerLoading={props?.isServerLoading}
                {...props?.searchType}
            />)}
        </Box>
    </>)
}

export type { DataTableHeaderDefaultProps }
export default DataTableHeaderDefault