import { useTranslation } from "react-i18next";
import DataTableLike, { DataTableLikeProps, DataTableLikeRef } from "./DataTableLike";
import { useEffect, useState, forwardRef } from "react"
const DataTableLikeTranslation = forwardRef<DataTableLikeRef, DataTableLikeProps>((props, ref) => {
    const { t, i18n } = useTranslation(['datatables'])
    const [tableTranslation, setTableTranslation] = useState<DataTableLikeProps['translation']>({})
    const [filterTranslation, setFilterTranslation] = useState<DataTableLikeProps['filterTranslation']>({})
    useEffect(() => {
        setTableTranslation({
            GlobalSearchValueTextFieldLabel: t('datatables:GlobalSearchValueTextFieldLabel'),
            GlobalSearchRegexSwitchLabel: t('datatables:GlobalSearchRegexSwitchLabel'),
            GlobalSearchIsNotSwitchLabel: t('datatables:GlobalSearchIsNotSwitchLabel'),
            FirstDataPrefix: t('datatables:FirstDataPrefix'),
            FirstDataBetweenLastData: t('datatables:FirstDataBetweenLastData'),
            LastDataBetweenFilteredTotal: t('datatables:LastDataBetweenFilteredTotal'),
            FilteredTotalPostfix: t('datatables:FilteredTotalPostfix'),
            DataTotalPrefix: t('datatables:DataTotalPrefix'),
            DataTotalPostfix: t('datatables:DataTotalPostfix'),
            RowsPerPage: t('datatables:RowsPerPage')
        })
        setFilterTranslation({
            DataTypeSelect: t('datatables:DataTypeSelect'),
            DefaultSelectTypeItem: t('datatables:DefaultSelectTypeItem'),
            NumberSelectTypeItem: t('datatables:NumberSelectTypeItem'),
            DateSelectTypeItem: t('datatables:DateSelectTypeItem'),
            StringSelectTypeItem: t('datatables:StringSelectTypeItem'),
            ArraySelectTypeItem: t('datatables:ArraySelectTypeItem'),
            NullSelectTypeItem: t('datatables:NullSelectTypeItem'),
            ClearSelectTypeItem: t('datatables:ClearSelectTypeItem'),
            DefaultValueLabel: t('datatables:DefaultValueLabel'),
            DefaultRegexLabel: t('datatables:DefaultRegexLabel'),
            DefaultIsNotLabel: t('datatables:DefaultIsNotLabel'),
            NumEqualToggleLabel: t('datatables:NumEqualToggleLabel'),
            NumLowerToggleLabel: t('datatables:NumLowerToggleLabel'),
            NumBothToggleLabel: t('datatables:NumBothToggleLabel'),
            NumGreaterToggleLabel: t('datatables:NumGreaterToggleLabel'),
            NumValueTextFieldLabel: t('datatables:NumValueTextFieldLabel'),
            NumLowerTextFieldLabel: t('datatables:NumLowerTextFieldLabel'),
            NumGreaterTextFieldLabel: t('datatables:NumGreaterTextFieldLabel'),
            NumEqualSwitchLabel: t('datatables:NumEqualSwitchLabel'),
            NumNotEqualSwitchLabel: t('datatables:NumNotEqualSwitchLabel'),
            DateEqualToggleLabel: t('datatables:DateEqualToggleLabel'),
            DateLowerToggleLabel: t('datatables:DateLowerToggleLabel'),
            DateBothToggleLabel: t('datatables:DateBothToggleLabel'),
            DateGreaterToggleLabel: t('datatables:DateGreaterToggleLabel'),
            DateValueTextFieldLabel: t('datatables:DateValueTextFieldLabel'),
            DateLowerTextFieldLabel: t('datatables:DateLowerTextFieldLabel'),
            DateGreaterTextFieldLabel: t('datatables:DateGreaterTextFieldLabel'),
            DateEqualSwitchLabel: t('datatables:DateEqualSwitchLabel'),
            DateNotEqualSwitchLabel: t('datatables:DateNotEqualSwitchLabel'),
            ArrValueLabel: t('datatables:ArrValueLabel'),
            ArrIsNotSwitchLabel: t('datatables:ArrIsNotSwitchLabel'),
            StrEqualToggleLabel: t('datatables:StrEqualToggleLabel'),
            StrStartToggleLabel: t('datatables:StrStartToggleLabel'),
            StrContainToggleLabel: t('datatables:StrContainToggleLabel'),
            StrEndToggleLabel: t('datatables:StrEndToggleLabel'),
            StrValueTextFieldLabel: t('datatables:StrValueTextFieldLabel'),
            StrNotEqualSwitchLabel: t('datatables:StrNotEqualSwitchLabel'),
            StrExcludeSwitchLabel: t('datatables:StrExcludeSwitchLabel'),
            NulIsNullToggleLabel: t('datatables:NulIsNullToggleLabel'),
            NulAnyToggleLabel: t('datatables:NulAnyToggleLabel'),
            NulNotNullToggleLabel: t('datatables:NulNotNullToggleLabel')
        })
    }, [i18n.language])
    return (<DataTableLike
        translation={tableTranslation}
        filterTranslation={filterTranslation}
        {...props}
        ref={ref}
    />)
})

export default DataTableLikeTranslation