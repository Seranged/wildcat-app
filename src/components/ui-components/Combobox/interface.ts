

export type ComboboxItem = {
    value: string,
    id: string,
    label: string,
}

export type ComboboxProps = {
    value: string | null,
    onSelect: (value: string) => void,
    onSearch: (value: string) => void,
    options: ComboboxItem[]
}