#!/usr/bin/env node
'use strict'

require('dotenv').load()
require('console.table')

const moment                = require('moment-business-days')
const api                   = require('./api')
const groupBy               = require('./util/groupBy')
const curriedGroupBy        = getter => list => groupBy(list, getter)

const formatDate            = f => d => moment(d).format(f)
const fullDate              = formatDate('DD/MM/YYYY')
const getTextualMonth       = formatDate('MMMM')
const diffDates             = (start, end) => Math.abs(moment(start).businessDiff(moment(end), 'days')) + 1

const sortAsc               = (a, b) => a - b
const sortMapKeysAsc        = map => Array.from(map.keys()).sort(sortAsc)

const filterMyHoliday       = values => values[1].filter(e => e.employeeId === values[0].id)
const filterHolidayEvents   = holiday => holiday.filter(e => e.policyTypeDisplayName.toLowerCase() === 'holiday')

const timeOff               = holiday => `${fullDate(holiday.startDate)} ${portionMap.start[holiday.startDatePortion]} - ${fullDate(holiday.endDate)} ${portionMap.end[holiday.endDatePortion]}`
const timeOffInBusinessDays = holiday => `(${diffDates(holiday.startDate, holiday.endDate)} business days)`

const portionMap            = {
    start: {
        all_day: "09:00",
        afternoon: "12:00",
        morning: "09:00",
    },
    end: {
        all_day: "17:30",
        afternoon: "17:30",
        morning: "12:00",
    },
}

Promise
    .all([api.me(), api.holiday()])
    .then(filterMyHoliday)
    .then(filterHolidayEvents)
    .then(curriedGroupBy(e => new Date(e.startDate).getMonth()))
    .then(map => {
        sortMapKeysAsc(map).forEach(month => {
            // console.log(`${getTextualMonth(map.get(month)[0].startDate)}`)
            const data = []

            map
                .get(month)
                .sort()
                .reverse()
                .forEach(holiday => data.push({
                    Start: fullDate(holiday.startDate),
                    End: fullDate(holiday.endDate),
                    Days: diffDates(holiday.startDate, holiday.endDate)
                }))

            console.table(getTextualMonth(map.get(month)[0].startDate), data)
        })
    })
