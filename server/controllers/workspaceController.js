import Workspace from '../models/Workspace.js';
import Board from '../models/Board.js';
import List from '../models/List.js';
import User from '../models/User.js';

export const getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find();
    return res.json(workspaces);
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let workspace = await Workspace.findOne({ id });

    if (!workspace) {
      // Fallback: try first workspace if generic request
      workspace = await Workspace.findOne();
    }

    if (!workspace) {
      return res.status(404).json({ message: `Workspace not found: ${id}` });
    }

    return res.json(workspace);
  } catch (error) {
    next(error);
  }
};

export const createWorkspace = async (req, res, next) => {
  try {
    const { name, key, category, type, description, ownerId } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    const wsKey = key ? key.trim().toUpperCase() : name.trim().substring(0, 3).toUpperCase();
    const wsId = `ws_${Date.now()}`;

    // Look up owner user if available
    let ownerUser = null;
    if (ownerId) {
      ownerUser = await User.findOne({ id: ownerId });
    }

    const defaultMember = {
      id: `mem_${Date.now()}`,
      name: ownerUser?.name || 'Owner',
      email: ownerUser?.email || 'owner@workspace.com',
      role: 'Admin',
      initials: ownerUser?.initials || 'OW',
      avatarColor: '#FF8B00',
      status: 'Active',
      joinedAt: new Date(),
    };

    const newWorkspace = await Workspace.create({
      id: wsId,
      name: name.trim(),
      key: wsKey,
      category: category || 'Software',
      type: type || 'Team-managed',
      description: description || '',
      plan: 'Standard',
      ownerId: ownerId || defaultMember.id,
      members: [defaultMember],
    });

    // Also auto-create a default board and lists for this new workspace
    const boardId = `board_${Date.now()}`;
    await Board.create({
      id: boardId,
      workspaceId: wsId,
      name: `${newWorkspace.name} Board`,
      type: 'kanban',
      filter: 'all',
    });

    const defaultColumns = [
      { id: `list_todo_${Date.now()}`, title: 'To Do', order: 0 },
      { id: `list_in_progress_${Date.now()}`, title: 'In Progress', order: 1 },
      { id: `list_in_review_${Date.now()}`, title: 'In Review', order: 2 },
      { id: `list_done_${Date.now()}`, title: 'Done', order: 3 },
    ];

    for (const col of defaultColumns) {
      await List.create({
        id: col.id,
        boardId,
        title: col.title,
        order: col.order,
        cardIds: [],
      });
    }

    return res.status(201).json(newWorkspace);
  } catch (error) {
    next(error);
  }
};

export const updateWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const workspace = await Workspace.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );

    if (!workspace) {
      return res.status(404).json({ message: `Workspace not found: ${id}` });
    }

    return res.json(workspace);
  } catch (error) {
    next(error);
  }
};

export const inviteMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, role = 'Member' } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Member email is required' });
    }

    const workspace = await Workspace.findOne({ id });
    if (!workspace) {
      return res.status(404).json({ message: `Workspace not found: ${id}` });
    }

    const existingMember = workspace.members.find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );
    if (existingMember) {
      return res.status(409).json({ message: `Member with email ${email} is already in this workspace.` });
    }

    const name = email.split('@')[0].replace(/[._]/g, ' ');
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const colors = ['#0052CC', '#36B37E', '#FF8B00', '#6554C0', '#00C7E6'];
    const newMember = {
      id: `mem_${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: email.trim().toLowerCase(),
      role,
      initials: initials || 'US',
      avatarColor: colors[workspace.members.length % colors.length],
      status: 'Active',
      joinedAt: new Date(),
    };

    workspace.members.push(newMember);
    await workspace.save();

    return res.status(201).json(newMember);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;
    const workspace = await Workspace.findOne({ id });

    if (!workspace) {
      return res.status(404).json({ message: `Workspace not found: ${id}` });
    }

    workspace.members = workspace.members.filter((m) => m.id !== memberId);
    await workspace.save();

    return res.json({ success: true, removedMemberId: memberId });
  } catch (error) {
    next(error);
  }
};
