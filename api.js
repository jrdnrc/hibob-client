const axios = require('axios')
const api   = path => `https://api.hibob.com/v1/${path}`

axios.defaults.headers.common = {
    Authorization: process.env.HIBOB_KEY,
}

module.exports = {
    getAllEmployees:         () => axios.get(api('people')).then(res => res.data.employees),
    getEmployeeWorkHistory:  id => axios.get(api(`people/${id}/work`)),
    offToday:                () => axios.get(api('timeoff/outtoday')).then(res => res.data.outs)
}
