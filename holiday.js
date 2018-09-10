#!/usr/bin/env node
'use strict'

require('dotenv').load()

const moment                = require('moment-business-days')
const api                   = require('./api')
const Table                 = require('easy-table')
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
            const t = new Table

            map
                .get(month)
                .sort()
                .reverse()
                .forEach(holiday => {
                    t.cell('Start', `${fullDate(holiday.startDate)} ${portionMap.start[holiday.startDatePortion]}`)
                    t.cell('End', `${fullDate(holiday.endDate)} ${portionMap.end[holiday.endDatePortion]}`)
                    t.cell('Business Days', diffDates(holiday.startDate, holiday.endDate))
                    t.newRow()
                })

            t.total('Business Days', {
                printer: val => `${val} days.`,
                reduce: (acc, val) => acc + val
            })

            console.info(getTextualMonth(map.get(month)[0].startDate))
            console.info('-'.padStart(getTextualMonth(map.get(month)[0].startDate).length * 1.5, '-'))
            console.log(t.toString())
        })
    })
