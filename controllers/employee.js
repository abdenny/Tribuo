const express = require('express');
const router = express.Router();
const db = require('../models');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

router.use(cookieParser());
router.use(
  session({
    secret: 'Tribuo',
    cookie: { secure: false, maxAge: 5 * 24 * 60 * 60 * 1000 }
  })
);

let auth = (req, res, next) => {
  if (req.session.employee_email_address) {
    if (req.session.is_manager == true) {
      res.redirect('/manager');
    } else {
      next();
    }
  } else {
    res.redirect('/login');
  }
};

router.get('/employee', auth, (req, res) => {
  let department_id = req.session.department_id;
  let employee_first_name = req.session.employee_first_name;
  let employee_last_name = req.session.employee_last_name;
  let employee_id = req.session.employee_id;
  let id = req.session.employee_id;
  let department_title = '';
  let taskInfo = [];

  db.tasks
    .findAll({
      where: { department_id: department_id }
    })
    .then(results => {
      let testing = results.forEach(element => {
        if (element.employee_id == null || false) {
          taskInfo.push(element);
        }
      });
      console.log(taskInfo);
      db.departments
        .findAll({ where: { id: department_id } })
        .then(departmentsresult => {
          department_title = departmentsresult[0].department_title;
        })
        .then(() => {
          db.tasks
            .findAll({ where: { employee_id: id, task_status: 'In progress' } })
            .then(specificresults => {
              return specificresults;
            })
            .then(specificresults => {
              console.log(specificresults);
              res.render('employee', {
                taskInfo: taskInfo,
                specificTaskInfo: specificresults,
                employee_first_name: employee_first_name,
                employee_last_name: employee_last_name,
                department_title: department_title,
                employee_id: employee_id
              });
            });
        });
    });
});

router.get('/employeelogout', (req, res, next) => {
  console.log('log out post recieved');
  if (req.session) {
    // delete session object
    req.session.destroy(err => {
      if (err) {
        next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/employee', (req, res) => {
  console.log('employee post');
  let task_title = req.body.taskTitle;
  let task_instruction = req.body.taskInstruction;
  let department_id = req.session.department_id;

  db.tasks
    .create({
      task_title,
      task_instruction,
      department_id
    })
    .then(result => {
      let newTaskID = result.dataValues.id;
      console.log(newTaskID);
      res.send(`${newTaskID}`);
    });
});

router.post('/employeeselectedtask', (req, res) => {
  let selectedTask = req.body.selectedTask;
  let id = req.session.employee_id;

  db.tasks.findByPk(selectedTask).then(taskselected => {
    taskselected.employee_id = id;
    taskselected.save().then(result => {
      res.send(result);
    });
  });
});

router.post('/employeecompletedtask', (req, res) => {
  let completedTask = req.body.completedTask;

  db.tasks.findByPk(completedTask).then(taskselected => {
    console.log(taskselected);
    taskselected.task_status = 'Completed';
    taskselected.save();
  });
});

router.get('/employeelogout', (req, res, next) => {
  console.log('log out post recieved');
  if (req.session) {
    // delete session object
    req.session.destroy(err => {
      if (err) {
        next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;
