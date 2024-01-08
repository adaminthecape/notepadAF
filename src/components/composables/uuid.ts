function generateNumber(limit: number)
{
    const value = limit * Math.random();
    return value | 0;
}
function generateX()
{
    const value = generateNumber(16);
    return value.toString(16);
}
function generateXes(count: number)
{
    let result = '';
    for (let i = 0; i < count; ++i)
    {
        result += generateX();
    }
    return result;
}
function generateVariant()
{
    const value = generateNumber(16);
    const variant = (value & 0x3) | 0x8;
    return variant.toString(16);
}
// UUID v4
//
//   varsion: M=4
//   variant: N
//   pattern: xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
//
function generate()
{
    const result = generateXes(8)
        + '-' + generateXes(4)
        + '-' + '4' + generateXes(3)
        + '-' + generateVariant() + generateXes(3)
        + '-' + generateXes(12);
    return result;
};
function validate(id: string)
{
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i
    .test(id);
}

export { generate, validate };
