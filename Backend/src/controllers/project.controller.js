const Project = require('../models/project.model');

exports.saveProject = async (req, res) => {
  try {
    const { id, name, ir } = req.body;
    const userId = req.user._id;

    if (!name || !ir) {
      return res.status(400).json({ message: 'Project name and configuration are required' });
    }

    let project;

    if (id) {
      // Update existing project
      project = await Project.findOneAndUpdate(
        { _id: id, owner: userId },
        { name, ir },
        { new: true, runValidators: true }
      );

      if (!project) {
        return res.status(404).json({ message: 'Project not found or unauthorized' });
      }
    } else {
      // Create new project
      project = new Project({
        name,
        ir,
        owner: userId,
      });
      await project.save();
    }

    return res.status(200).json({
      message: 'Project saved successfully',
      project: {
        id: project._id,
        name: project.name,
        ir: project.ir,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    console.error('Save project error:', error);
    return res.status(500).json({ message: 'Server error during project saving', error: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({ owner: userId }).sort({ updatedAt: -1 });

    const formattedProjects = projects.map((p) => ({
      id: p._id,
      name: p.name,
      ir: p.ir,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return res.status(200).json({
      projects: formattedProjects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({ message: 'Server error retrieving projects', error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const projectId = req.params.id;

    const project = await Project.findOneAndDelete({ _id: projectId, owner: userId });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    return res.status(200).json({
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({ message: 'Server error during project deletion', error: error.message });
  }
};
