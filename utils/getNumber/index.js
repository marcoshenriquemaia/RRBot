const getNumber = (string) => {
  return Number(string.replace(/\D/g, ''))
}

export default getNumber