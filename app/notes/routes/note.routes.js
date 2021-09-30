const express = require('express');
const router = express.Router();
const notesController = require('../controllers/note.controller')
const authMiddleware = require('../../../middlewares/authMiddlewares')

router.post('/create',
    authMiddleware.Auth,
    notesController.create);

router.put('/:noteId',
    authMiddleware.Auth,
    notesController.updateNote);

router.put('/activate/sharing/:noteId',
    authMiddleware.Auth,
    notesController.activateSharing);

router.put('/deactivate/sharing/:noteId',
    authMiddleware.Auth,
    notesController.deactivateSharing);

router.delete('/:noteId',
    authMiddleware.Auth,
    notesController.delete);

router.post('/get/all/mine',
    authMiddleware.Auth,
    notesController.getAllMyNotes);

router.post('/get/all/shared',
    authMiddleware.Auth,
    notesController.getSharedNotes);


module.exports = router;
