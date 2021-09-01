const endpoint = 'https://wnvgqqihv6.execute-api.ap-southeast-2.amazonaws.com/Public/public/rates'

const get = async (params) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const hasParams = params ? `?${objectToQueryString(params)}` : ''

  const response = await fetch(endpoint + hasParams, options)
  const result = await response.json()

  return result
}

const objectToQueryString = obj => Object.keys(obj).map(key => key + '=' + obj[key]).join('&')

const Fetch = {
    get
}
  
export default Fetch