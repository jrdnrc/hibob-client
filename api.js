const axios       = require('axios')
const api         = path => `https://api.hibob.com/${path}`
const apiv1       = path => api(`v1/${path}`)
const extractData = res => res.data
const extractPath = path => res => res.data[path]

axios.defaults.headers.common = {
    Authorization: process.env.HIBOB_KEY,
}

module.exports = {
    getAllEmployees:         () => axios.get(apiv1('people')).then(res => res.data.employees),
    getEmployeeWorkHistory:  id => axios.get(apiv1(`people/${id}/work`)),
    offToday:                () => axios.get(apiv1('timeoff/outtoday')).then(res => res.data.outs),
    me:                      () => axios.get(api('api/user')).then(extractData),
    holiday:                 () => axios.get(apiv1(`timeoff/requests/changes?since=2007-04-05T12%3A30-02%3A00`)).then(extractPath('changes')),
}
