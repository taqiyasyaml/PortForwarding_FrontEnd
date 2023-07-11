export default (phone: string): boolean => (
    /^[+]?([ ]?\(([0-9]+[ .-])*[0-9]+\)[ ]?)?([0-9]+[ .-])*[0-9]+$/
        .test(phone)
)