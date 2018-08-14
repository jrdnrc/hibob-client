#!/usr/bin/env node
'use strict'

require('dotenv').load()

const api = require('./api')

const filterByDept           = dept => employees => employees.filter(e => e.work.department === dept)
const extractIds             = employees => employees.map(e => e.id)

const department             = process.argv[2] || 'ENG'
const diff                   = (a, b) => a.filter(val => b.indexOf(val) === -1)
const exceptionHandler       = err => console.log(err.code === 'ETIMEDOUT' ? 'Timed out!' : err)

function determineCapacity (departmentEmployees) {
    employeesOutToday()
        .then(filterByDept(department))
        .then(function (out) {
            const
                outIds                = out.map(e => e.id),
                departmentEmployeesIn = diff(departmentEmployees, outIds),
                capacity              = (departmentEmployeesIn.length / departmentEmployees.length) * 100

            console.info(`In: ${departmentEmployeesIn.length} | Out: ${outIds.length} | Dept: ${departmentEmployees.length}`)
            console.info(`Capacity is: ${capacity.toFixed(2)}%`)
        })
        .catch(exceptionHandler)
}

async function employeesOutToday() {
    try {
        const workHistoryMapper = async e => {
            return {
                id: e.employeeId,
                name: e.employeeDisplayName,
                work: {
                    department: (await api.getEmployeeWorkHistory(e.employeeId)).data.values.shift().department
                }
            }
        }

        try {
            return Promise.all(
                (await api.offToday())
                    .filter(d => d.policyTypeDisplayName === 'Holiday')
                    .map(await workHistoryMapper)
            )
        } catch (e) {
            console.log('Failed to find out who was out today.')
            console.log(e)
        }
    } catch (e) {
        console.log('Failed to get work history.')
        console.log(e)
    }
}

api.getAllEmployees()
    .then(filterByDept(department))
    .then(extractIds)
    .then(determineCapacity)
    .catch(exceptionHandler)
