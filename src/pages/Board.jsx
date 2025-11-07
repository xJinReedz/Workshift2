import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const Board = () => {
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [isCardCompleted, setIsCardCompleted] = useState(false);

  useEffect(() => {
    const initializePage = () => {
      // Check authentication on page load - exactly like original
      if (!window.api || !window.api.isAuthenticated()) {
        navigate('/login');
      } else {
        // Initialize board with the ID from URL params
        if (window.initializeBoard) {
          window.initializeBoard(boardId || 1);
        }
        
        // Initialize tab counts after a short delay to ensure DOM is ready
        setTimeout(() => {
          updateMemberCount();
          updateRequestCount();
        }, 200);
      }
    };

    // If database is already loaded, initialize immediately
    if (window.db && window.api) {
      initializePage();
    } else {
      // Wait for database and API to be ready
      const checkReady = setInterval(() => {
        if (window.db && window.api) {
          clearInterval(checkReady);
          initializePage();
        }
      }, 100);
      
      // Cleanup interval on unmount
      return () => clearInterval(checkReady);
    }
  }, [navigate, boardId]);

  const openProfileModal = () => {
    if (window.openProfileModal) {
      window.openProfileModal();
    }
  };

  const editBoardTitle = () => {
    if (window.editBoardTitle) {
      window.editBoardTitle();
    }
  };

  const saveBoardTitle = () => {
    if (window.saveBoardTitle) {
      window.saveBoardTitle();
    }
  };

  const cancelTitleEdit = () => {
    if (window.cancelTitleEdit) {
      window.cancelTitleEdit();
    }
  };

  const showBoardStatistics = () => {
    if (window.showBoardStatistics) {
      window.showBoardStatistics();
    }
  };

  const closeCardModal = () => {
    if (window.closeCardModal) {
      window.closeCardModal();
    }
  };

  const openLabelsModal = () => {
    if (window.openLabelsModal) {
      window.openLabelsModal();
    }
  };

  const deleteCardConfirm = () => {
    if (window.deleteCardConfirm) {
      window.deleteCardConfirm();
    }
  };

  const saveAllCardChanges = () => {
    if (window.saveAllCardChanges) {
      window.saveAllCardChanges();
    }
  };

  const toggleCardComplete = () => {
    if (window.toggleCardComplete) {
      window.toggleCardComplete();
    }
  };

  // Function to update card completion state from JavaScript
  const updateCardCompletionState = (isCompleted) => {
    setIsCardCompleted(isCompleted);
  };

  // Expose the function to window so JavaScript can call it
  useEffect(() => {
    window.updateCardCompletionState = updateCardCompletionState;
  }, []);

  const showAttachmentUpload = () => {
    if (window.showAttachmentUpload) {
      window.showAttachmentUpload();
    }
  };

  const addChecklistItemInline = () => {
    if (window.addChecklistItemInline) {
      window.addChecklistItemInline();
    }
  };

  const cancelAddItem = () => {
    if (window.cancelAddItem) {
      window.cancelAddItem();
    }
  };

  const showAddItemForm = () => {
    if (window.showAddItemForm) {
      window.showAddItemForm();
    }
  };

  const addComment = () => {
    if (window.addComment) {
      window.addComment();
    }
  };

  const cancelComment = () => {
    if (window.cancelComment) {
      window.cancelComment();
    }
  };

  const closeLabelsModal = () => {
    if (window.closeLabelsModal) {
      window.closeLabelsModal();
    }
  };

  const createLabel = () => {
    if (window.createLabel) {
      window.createLabel();
    }
  };

  const closeEditLabelModal = () => {
    if (window.closeEditLabelModal) {
      window.closeEditLabelModal();
    }
  };

  const saveEditLabel = () => {
    if (window.saveEditLabel) {
      window.saveEditLabel();
    }
  };

  const closeDeleteLabelModal = () => {
    if (window.closeDeleteLabelModal) {
      window.closeDeleteLabelModal();
    }
  };

  const confirmDeleteLabel = () => {
    if (window.confirmDeleteLabel) {
      window.confirmDeleteLabel();
    }
  };

  const closeChecklistModal = () => {
    if (window.closeChecklistModal) {
      window.closeChecklistModal();
    }
  };

  const addChecklistItem = () => {
    if (window.addChecklistItem) {
      window.addChecklistItem();
    }
  };

  const closeRenameListModal = () => {
    if (window.closeRenameListModal) {
      window.closeRenameListModal();
    }
  };

  const saveListRename = () => {
    // Let the JavaScript function handle the rename completely
    if (window.saveListRename) {
      window.saveListRename();
    }
  };

  const closeDeleteListModal = () => {
    if (window.closeDeleteListModal) {
      window.closeDeleteListModal();
    }
  };

  const confirmDeleteList = () => {
    // Let the JavaScript function handle the delete completely
    if (window.deleteList) {
      // Get the list ID from the modal
      const modal = document.getElementById('deleteConfirmationModal');
      const confirmBtn = document.getElementById('confirmDeleteBtn');
      // The JavaScript function should handle the deletion
      if (confirmBtn && confirmBtn.onclick) {
        confirmBtn.onclick();
      }
    }
  };

  const closeModal = (modal) => {
    if (window.closeModal) {
      window.closeModal(modal);
    }
  };

  const handleAddCard = (event) => {
    if (window.handleAddCard) {
      window.handleAddCard(event);
    }
  };

  const closeAddListModal = () => {
    if (window.closeAddListModal) {
      window.closeAddListModal();
    }
  };

  const handleAddListSubmit = (event) => {
    if (window.handleAddListSubmit) {
      window.handleAddListSubmit(event);
    }
  };

  const closeInvitationSuccessModal = () => {
    if (window.closeInvitationSuccessModal) {
      window.closeInvitationSuccessModal();
    }
  };

  const closeRemoveMemberModal = () => {
    if (window.closeRemoveMemberModal) {
      window.closeRemoveMemberModal();
    }
  };

  const confirmRemoveMember = () => {
    // Close the remove confirmation modal first
    const confirmModal = document.getElementById('removeMemberModal');
    if (confirmModal) confirmModal.classList.remove('active');
    
    // Get the member name to remove
    const memberNameElement = document.getElementById('memberToRemoveName');
    const memberToRemove = memberNameElement ? memberNameElement.textContent : '';
    
    // Remove the member from the DOM
    if (memberToRemove) {
      // Find and remove the member item from the invite modal
      const memberItems = document.querySelectorAll('.member-item');
      memberItems.forEach(item => {
        const nameElement = item.querySelector('.member-name');
        if (nameElement && nameElement.textContent === memberToRemove) {
          item.remove();
        }
      });
      
      // Update the member count
      updateMemberCount();
    }
    
    // Execute the removal logic
    if (window.confirmRemoveMember) {
      window.confirmRemoveMember();
    }
    
    // Show success modal after a brief delay
    setTimeout(() => {
      const successModal = document.getElementById('memberRemovedModal');
      if (successModal) successModal.classList.add('active');
    }, 100);
  };

  const closeJoinRequestModal = () => {
    if (window.closeJoinRequestModal) {
      window.closeJoinRequestModal();
    }
  };

  const confirmJoinRequest = () => {
    if (window.confirmJoinRequest) {
      window.confirmJoinRequest();
    }
  };

  const closeRequestAcceptedModal = () => {
    if (window.closeRequestAcceptedModal) {
      window.closeRequestAcceptedModal();
    }
  };

  const closeRequestDeclinedModal = () => {
    if (window.closeRequestDeclinedModal) {
      window.closeRequestDeclinedModal();
    }
  };

  const closeMemberRemovedModal = () => {
    if (window.closeMemberRemovedModal) {
      window.closeMemberRemovedModal();
    }
  };

  const updateMemberCount = () => {
    const memberItems = document.querySelectorAll('#boardMembersList .member-item');
    const memberCountElement = document.querySelector('[data-tab="members"] .tab-count');
    if (memberCountElement) {
      memberCountElement.textContent = memberItems.length;
    }
  };

  const updateRequestCount = () => {
    const requestItems = document.querySelectorAll('#joinRequestsList .request-item');
    const requestCountElement = document.querySelector('[data-tab="requests"] .tab-count');
    if (requestCountElement) {
      requestCountElement.textContent = requestItems.length;
    }
  };

  const closeBoardStatistics = () => {
    if (window.closeBoardStatistics) {
      window.closeBoardStatistics();
    }
  };

  const showAddListModal = () => {
    if (window.showAddListModal) {
      window.showAddListModal();
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <Link to="/" className="navbar-brand">
              <i className="fas fa-tasks"></i> WorkShift
            </Link>
            
            <ul className="navbar-nav">
              <li><Link to="/">Boards</Link></li>
              <li><Link to="/calendar">Calendar</Link></li>
              <li><Link to="/inbox">Inbox</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
            </ul>
            
            <div className="navbar-actions">
              <div className="search-container">
                <i className="fas fa-search search-icon"></i>
                <input type="text" className="search-input" placeholder="Search this board..." />
              </div>
              
              <button className="mobile-menu-toggle" aria-label="Menu">
                <i className="fas fa-bars" style={{color: '#172b4d !important', display: 'inline-block !important'}}></i>
                <span style={{display: 'none', fontSize: '24px', lineHeight: '1'}}>☰</span>
              </button>
              
              <div className="profile-dropdown">
                <div className="profile-avatar" onClick={openProfileModal}>LT</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="board-container">
        
        <div className="board-header">
          <div className="board-title-section">
            <h1 className="board-title" id="boardTitle" data-board-id="1" onClick={editBoardTitle}>
              <span className="title-text" id="boardTitleText">Website Redesign</span>
              <i className="fas fa-pencil-alt edit-icon"></i>
            </h1>
            <div className="title-edit-form" style={{display: 'none'}}>
              <input 
                type="text" 
                id="boardTitleInput" 
                className="form-control" 
                defaultValue="Website Redesign"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveBoardTitle();
                  } else if (e.key === 'Escape') {
                    cancelTitleEdit();
                  }
                }}
              />
              <button id="saveTitleBtn" className="btn btn-primary btn-sm" onClick={saveBoardTitle}>Save</button>
              <button id="cancelEditBtn" className="btn btn-secondary btn-sm btn-cancel" onClick={cancelTitleEdit}>Cancel</button>
            </div>
            <div className="board-visibility">
              <i className="fas fa-users"></i>
              <span>Team Visible</span>
            </div>
            <button className="board-statistics" onClick={showBoardStatistics}>
              <i className="fas fa-chart-bar"></i>
              Statistics
            </button>
          </div>
          
          <div className="board-actions">
            <div className="board-members-header" id="boardMembers">
              <div className="avatar" style={{background: '#0079bf'}} title="Luc Trevecedo">LT</div>
              <div className="avatar" style={{background: '#61bd4f'}} title="Paolo Rayos">PR</div>
              <div className="avatar" style={{background: '#f2d600', color: '#333'}} title="Elijah Sintor">ES</div>
              <div className="avatar" style={{background: '#eb5a46'}} title="Nathaniel Andrada">NA</div>
            </div>
           
            <div id="manila-clock" className="manila-clock" title="Manila (PHT)"></div>
            
            <button className="invite-btn" onClick={() => {
              const modal = document.getElementById('inviteModal');
              if (modal) {
                modal.classList.add('active');
                if (window.initializeInviteModalTabs) {
                  window.initializeInviteModalTabs();
                }
              }
            }}>
              <i className="fas fa-user-plus"></i>
              Invite
            </button>
          </div>
        </div>

        <div className="lists-container" id="boardLists">
          {/* Lists will be loaded dynamically */}
        </div>
      </div>

      {/* All the modals from the original HTML */}
      {/* Card Detail Modal */}
      <div id="card-detail-modal" className="modal card-modal">
        <div className="modal-content card-modal-content">
          <div className="modal-header card-modal-header">
            <div className="card-title-container">
              <i className="fas fa-credit-card card-icon"></i>
              <input type="text" className="card-title-edit" id="cardTitleEdit" placeholder="Card title..." />
              <div className="card-list-location" id="cardListLocation">
                <small className="text-muted">in list <span id="cardListName">Loading...</span></small>
              </div>
            </div>
            <button className="modal-close" onClick={closeCardModal}>&times;</button>
          </div>
          
          <div className="modal-body card-modal-body">
            <div className="card-details-layout">
              <div className="card-main-content">
                {/* Description */}
                <div className="card-section">
                  <div className="section-header">
                    <i className="fas fa-align-left"></i>
                    <h3>Description</h3>
                  </div>
                  <div className="section-content">
                    <textarea className="card-description" id="cardDescription"></textarea>
                  </div>
                </div>

                {/* Deadline */}
                <div className="card-section" id="deadlineSection">
                  <div className="section-header">
                    <i className="fas fa-clock"></i>
                    <h3>Deadline</h3>
                  </div>
                  <div className="section-content">
                    <div className="deadline-inputs">
                      <div className="date-time-row">
                        <div className="input-group">
                          <label htmlFor="cardDueDate">Date</label>
                          <input type="date" id="cardDueDate" className="form-input" />
                        </div>
                        <div className="input-group">
                          <label htmlFor="cardDueTime">Time</label>
                          <input type="time" id="cardDueTime" className="form-input" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className="card-section" id="attachmentsSection">
                  <div className="section-header">
                    <i className="fas fa-paperclip"></i>
                    <h3>Attachments</h3>
                  </div>
                  <div className="section-content">
                    <div className="attachment-upload">
                      <button className="btn btn-outline" onClick={showAttachmentUpload}>
                        <i className="fas fa-plus"></i>
                        Add Attachment
                      </button>
                    </div>
                    <div className="attachments-list" id="attachmentsList">
                      <p className="no-attachments text-muted" style={{fontStyle: 'italic'}}>No attachments yet.</p>
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div className="card-section" id="checklistSection">
                  <div className="section-header">
                    <i className="fas fa-check-square"></i>
                    <h3>Checklist</h3>
                    <div className="checklist-progress" id="checklistProgressContainer" style={{display: 'none'}}>
                      <span className="progress-text" id="progressText">0/0</span>
                      <div className="progress-bar-container">
                        <div className="progress-bar" id="progressBar" style={{width: '0%'}}></div>
                      </div>
                    </div>
                  </div>
                  <div className="section-content">
                    <div className="checklist-items-inline" id="checklistItemsInline">
                      {/* Checklist items will be loaded here */}
                    </div>
                    <div className="add-checklist-item-inline">
                      <div className="add-item-form" style={{display: 'none'}} id="addItemForm">
                        <input type="text" id="newChecklistItemInline" className="form-input" placeholder="Add an item..." style={{marginBottom: '8px'}} />
                        <div className="form-actions">
                          <button className="btn btn-primary btn-sm" onClick={addChecklistItemInline}>Add</button>
                          <button className="btn btn-secondary btn-sm" onClick={cancelAddItem}>Cancel</button>
                        </div>
                      </div>
                      <button className="btn btn-outline" id="addItemBtn" onClick={showAddItemForm}>
                        <i className="fas fa-plus"></i>
                        Add an item
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="card-section" id="commentsSection">
                  <div className="section-header">
                    <i className="fas fa-comments"></i>
                    <h3>Comments</h3>
                  </div>
                  <div className="section-content">
                    <div className="comments-list" id="commentsList">
                      {/* Comments will be loaded here */}
                    </div>
                    <div className="add-comment-section">
                      <div className="comment-composer">
                        <div className="composer-input-container">
                          <textarea 
                            id="commentInput" 
                            className="comment-input" 
                            placeholder="Write a comment... Use @ to mention team members"
                            rows="3"
                          ></textarea>
                          <div className="mention-dropdown" id="mentionDropdown" style={{display: 'none'}}>
                            {/* Mention suggestions will appear here */}
                          </div>
                          <div className="comment-actions">
                            <button className="btn btn-primary btn-sm" onClick={addComment}>
                              <i className="fas fa-paper-plane"></i>
                              Comment
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-sidebar">
                <div className="sidebar-section">
                  <h4>ADD TO CARD</h4>
                  <div className="sidebar-actions">
                    <button className="sidebar-btn" onClick={openLabelsModal} title="Labels">
                      <i className="fas fa-tag"></i>
                      Labels
                    </button>
                  </div>
                </div>

                <div className="sidebar-section">
                  <h4>ACTIONS</h4>
                  <div className="sidebar-actions">
                    <button className="sidebar-btn danger-btn" onClick={deleteCardConfirm}>
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                    <button className="sidebar-btn primary-btn" onClick={saveAllCardChanges}>
                      <i className="fas fa-save"></i>
                      Save Changes
                    </button>
                    <button 
                      className={`sidebar-btn ${isCardCompleted ? 'warning-btn' : 'success-btn'}`} 
                      onClick={toggleCardComplete}
                    >
                      <i className={`fas ${isCardCompleted ? 'fa-undo' : 'fa-check'}`}></i>
                      {isCardCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All other modals - simplified for space but include all from original HTML */}
      <div id="listMenuDropdown" className="list-menu-dropdown" style={{display: 'none'}}>
        <div className="dropdown-content">
          <button className="dropdown-item" id="renameListBtn">
            <i className="fas fa-edit"></i>
            Rename List
          </button>
          <button className="dropdown-item danger" id="deleteListBtn">
            <i className="fas fa-trash"></i>
            Delete List
          </button>
        </div>
      </div>

      {/* Labels Modal */}
      <div id="labels-modal" className="modal labels-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Labels</h3>
            <button className="modal-close" onClick={closeLabelsModal}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="labels-search">
              <input type="text" id="labelsSearch" className="form-input" placeholder="Search labels..." />
            </div>
            <div className="labels-list" id="labelsList">
              {/* Labels will be loaded here */}
            </div>
            <div className="create-label-section">
              <h4>Create a new label</h4>
              <div className="label-form">
                <div className="input-with-counter">
                  <input type="text" id="newLabelName" className="form-input" placeholder="Label name..." maxLength="13" />
                  <div className="character-counter" id="newLabelCounter">0/13</div>
                </div>
                <div className="color-picker" id="colorPicker">
                  <div className="color-option selected" data-color="#61bd4f" style={{background: '#61bd4f'}}></div>
                  <div className="color-option" data-color="#f2d600" style={{background: '#f2d600'}}></div>
                  <div className="color-option" data-color="#ff9f1a" style={{background: '#ff9f1a'}}></div>
                  <div className="color-option" data-color="#eb5a46" style={{background: '#eb5a46'}}></div>
                  <div className="color-option" data-color="#c377e0" style={{background: '#c377e0'}}></div>
                  <div className="color-option" data-color="#0079bf" style={{background: '#0079bf'}}></div>
                  <div className="color-option" data-color="#2ecc71" style={{background: '#2ecc71'}}></div>
                  <div className="color-option" data-color="#e74c3c" style={{background: '#e74c3c'}}></div>
                  <div className="color-option" data-color="#9b59b6" style={{background: '#9b59b6'}}></div>
                  <div className="color-option" data-color="#3498db" style={{background: '#3498db'}}></div>
                </div>
                <button className="btn btn-primary" onClick={createLabel}>Create Label</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Label Modal */}
      <div id="edit-label-modal" className="modal edit-label-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Edit Label</h3>
            <button className="modal-close" onClick={closeEditLabelModal}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="edit-label-form">
              <div className="input-with-counter">
                <input type="text" id="editLabelName" className="form-input" placeholder="Label name..." maxLength="13" />
                <div className="character-counter" id="editLabelCounter">0/13</div>
              </div>
              <div className="color-picker" id="editColorPicker">
                <div className="color-option" data-color="#61bd4f" style={{background: '#61bd4f'}}></div>
                <div className="color-option" data-color="#f2d600" style={{background: '#f2d600'}}></div>
                <div className="color-option" data-color="#ff9f1a" style={{background: '#ff9f1a'}}></div>
                <div className="color-option" data-color="#eb5a46" style={{background: '#eb5a46'}}></div>
                <div className="color-option" data-color="#c377e0" style={{background: '#c377e0'}}></div>
                <div className="color-option" data-color="#0079bf" style={{background: '#0079bf'}}></div>
                <div className="color-option" data-color="#2ecc71" style={{background: '#2ecc71'}}></div>
                <div className="color-option" data-color="#e74c3c" style={{background: '#e74c3c'}}></div>
                <div className="color-option" data-color="#9b59b6" style={{background: '#9b59b6'}}></div>
                <div className="color-option" data-color="#3498db" style={{background: '#3498db'}}></div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={saveEditLabel}>Save Changes</button>
                <button className="btn btn-secondary" onClick={closeEditLabelModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Label Confirmation Modal */}
      <div id="delete-label-modal" className="modal delete-confirmation-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Delete Label</h3>
            <button className="modal-close" onClick={closeDeleteLabelModal}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="confirmation-message">
              <div className="warning-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="message-content">
                <h4 id="deleteLabelTitle">Delete this label?</h4>
                <p>This will remove the label from all cards. This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={confirmDeleteLabel}>Delete Label</button>
              <button className="btn btn-secondary" onClick={closeDeleteLabelModal}>Cancel</button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Checklist Item Modal */}
      <div id="edit-checklist-item-modal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Edit Checklist Item</h3>
            <button className="modal-close" onClick={() => window.closeEditChecklistItemModal && window.closeEditChecklistItemModal()}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="editChecklistItemInput">Item Text</label>
              <input 
                type="text" 
                id="editChecklistItemInput" 
                className="form-control" 
                placeholder="Enter item text..." 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    window.saveChecklistItemEdit && window.saveChecklistItemEdit();
                  } else if (e.key === 'Escape') {
                    window.closeEditChecklistItemModal && window.closeEditChecklistItemModal();
                  }
                }}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => window.closeEditChecklistItemModal && window.closeEditChecklistItemModal()}>Cancel</button>
            <button className="btn btn-primary" onClick={() => window.saveChecklistItemEdit && window.saveChecklistItemEdit()}>Save Changes</button>
          </div>
        </div>
      </div>

      {/* Delete Checklist Item Confirmation Modal */}
      <div id="delete-checklist-item-modal" className="modal delete-confirmation-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Delete Checklist Item</h3>
            <button className="modal-close" onClick={() => window.closeDeleteChecklistItemModal && window.closeDeleteChecklistItemModal()}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="confirmation-message">
              <div className="warning-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="message-content">
                <h4>Delete this checklist item?</h4>
                <p>Item: "<span id="deleteChecklistItemText"></span>"</p>
                <p>This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={() => window.confirmDeleteChecklistItem && window.confirmDeleteChecklistItem()}>Delete Item</button>
              <button className="btn btn-secondary" onClick={() => window.closeDeleteChecklistItemModal && window.closeDeleteChecklistItemModal()}>Cancel</button>
            </div>
          </div>
        </div>
      </div>

      {/* Add more modals as needed - simplified version but include all important ones */}
      
      {/* Board Statistics Modal */}
      <div id="board-statistics-modal" className="modal">
        <div className="modal-content" style={{maxWidth: '900px'}}>
          <div className="modal-header">
            <h3><i className="fas fa-chart-bar"></i> Board Statistics</h3>
            <button className="modal-close" onClick={closeBoardStatistics}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="statistics-overview">
              <div className="stat-card">
                <div className="stat-header">CARD COMPLETION RATE</div>
                <div className="stat-value stat-percentage" id="cardCompletionRate">0%</div>
                <div className="stat-description">Cards with 100% checklists done</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">COMPLETED CARDS</div>
                <div className="stat-value stat-number" id="completedCards">0</div>
                <div className="stat-description" id="completedCardsDesc">Out of 0 total cards</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">CHECKLIST PROGRESS</div>
                <div className="stat-value stat-percentage" id="checklistProgress">0%</div>
                <div className="stat-description" id="checklistProgressDesc">0/0 individual checklists</div>
              </div>
            </div>
            
            <div className="detailed-progress">
              <h4>Detailed Progress by List</h4>
              <div id="listProgressContainer">
                {/* List progress will be populated dynamically by updateStatisticsModal() */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <div id="inviteModal" className="modal" style={{zIndex: 9999}}>
        <div className="modal-content invite-modal-content" style={{zIndex: 10000}}>
          <div className="modal-header invite-modal-header">
            <h3>Invite to Board</h3>
            <span className="close-modal" onClick={() => {
              const modal = document.getElementById('inviteModal');
              if (modal) modal.classList.remove('active');
            }}>&times;</span>
          </div>
          <div className="modal-body invite-modal-body">
            <form id="inviteForm" className="invite-form">
              <div className="form-group">
                <label htmlFor="inviteEmail">Email</label>
                <input type="email" id="inviteEmail" name="email" className="form-control invite-email-input" required placeholder="Enter email address" />
              </div>
              <div className="form-group">
                <label htmlFor="permissionLevel">Permission</label>
                <select id="permissionLevel" name="permission" className="form-control invite-permission-select" required>
                  <option value="view">Can view</option>
                  <option value="edit">Can edit</option>
                </select>
              </div>
              <div className="form-actions invite-form-actions">
                <button type="button" className="btn btn-secondary invite-cancel-btn" id="cancelInvite" onClick={() => {
                  const modal = document.getElementById('inviteModal');
                  if (modal) modal.classList.remove('active');
                }}>Cancel</button>
                <button type="submit" className="btn btn-primary invite-send-btn">Send Invitation</button>
              </div>
            </form>

            {/* Tabbed Board Management Section */}
            <div className="board-management invite-board-management">
              <div className="tab-header invite-tab-header">
                <button className="tab-btn invite-tab-btn active" data-tab="members">
                  <span className="tab-text">Board members</span>
                  <span className="tab-count">5</span>
                </button>
                <button className="tab-btn invite-tab-btn" data-tab="requests">
                  <span className="tab-text">Join requests</span>
                  <span className="tab-count">2</span>
                </button>
              </div>
              
              <div className="tab-content invite-tab-content">
                {/* Board Members Tab */}
                <div id="membersTab" className="tab-panel invite-tab-panel active">
                  <div id="boardMembersList" className="members-list invite-members-list">
                    {/* Board members */}
                    <div className="member-item">
                      <div className="member-avatar" style={{background: '#0079bf'}}>LT</div>
                      <div className="member-info">
                        <div className="member-name">Luc Trevecedo</div>
                        <div className="member-role">Admin • luc@gmail.com</div>
                      </div>
                      <div className="member-status">Owner</div>
                    </div>
                    <div className="member-item">
                      <div className="member-avatar" style={{background: '#61bd4f'}}>PR</div>
                      <div className="member-info">
                        <div className="member-name">Paolo Rayos</div>
                        <div className="member-role">Can edit • paolo@gmail.com</div>
                      </div>
                      <div className="member-actions">
                        <select className="member-permission-select">
                          <option value="edit" selected>Can edit</option>
                          <option value="view">Can view</option>
                        </select>
                        <button className="btn btn-danger btn-sm member-remove-btn" onClick={() => {
                          const modal = document.getElementById('removeMemberModal');
                          const memberName = document.getElementById('memberToRemoveName');
                          if (memberName) memberName.textContent = 'Paolo Rayos';
                          if (modal) modal.classList.add('active');
                        }}>Remove</button>
                      </div>
                    </div>
                    <div className="member-item">
                      <div className="member-avatar" style={{background: '#eb5a46'}}>NA</div>
                      <div className="member-info">
                        <div className="member-name">Nathaniel Andrada</div>
                        <div className="member-role">Can edit • nathaniel@gmail.com</div>
                      </div>
                      <div className="member-actions">
                        <select className="member-permission-select">
                          <option value="edit" selected>Can edit</option>
                          <option value="view">Can view</option>
                        </select>
                        <button className="btn btn-danger btn-sm member-remove-btn" onClick={() => {
                          const modal = document.getElementById('removeMemberModal');
                          const memberName = document.getElementById('memberToRemoveName');
                          if (memberName) memberName.textContent = 'Nathaniel Andrada';
                          if (modal) modal.classList.add('active');
                        }}>Remove</button>
                      </div>
                    </div>
                    <div className="member-item">
                      <div className="member-avatar" style={{background: '#f2d600'}}>ES</div>
                      <div className="member-info">
                        <div className="member-name">Elijah Sintor</div>
                        <div className="member-role">Can view • elijah@gmail.com</div>
                      </div>
                      <div className="member-actions">
                        <select className="member-permission-select">
                          <option value="view" selected>Can view</option>
                          <option value="edit">Can edit</option>
                        </select>
                        <button className="btn btn-danger btn-sm member-remove-btn" onClick={() => {
                          const modal = document.getElementById('removeMemberModal');
                          const memberName = document.getElementById('memberToRemoveName');
                          if (memberName) memberName.textContent = 'Elijah Sintor';
                          if (modal) modal.classList.add('active');
                        }}>Remove</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Join Requests Tab */}
                <div id="requestsTab" className="tab-panel invite-tab-panel">
                  <div id="joinRequestsList" className="requests-list invite-requests-list">
                    <div className="request-item">
                      <div className="request-avatar" style={{background: '#c377e0'}}>AL</div>
                      <div className="request-info">
                        <div className="request-name">Andrew Llego</div>
                        <div className="request-email">andrew@gmail.com</div>
                        <div className="request-date">Requested 2 hours ago</div>
                      </div>
                      <div className="request-actions">
                        <button className="btn btn-success btn-sm" onClick={() => {
                          // Remove the request from join requests list
                          const requestItem = document.querySelector('.request-item');
                          if (requestItem) {
                            requestItem.remove();
                            // Update request count
                            updateRequestCount();
                          }
                          
                          // Add the user to board members list
                          const membersList = document.querySelector('#boardMembersList');
                          if (membersList) {
                            const newMember = document.createElement('div');
                            newMember.className = 'member-item';
                            newMember.innerHTML = `
                              <div class="member-avatar" style="background: #c377e0">AL</div>
                              <div class="member-info">
                                <div class="member-name">Andrew Llego</div>
                                <div class="member-role">Can edit • andrew@gmail.com</div>
                              </div>
                              <div class="member-actions">
                                <select class="member-permission-select">
                                  <option value="edit" selected>Can edit</option>
                                  <option value="view">Can view</option>
                                </select>
                                <button class="btn btn-danger btn-sm member-remove-btn">Remove</button>
                              </div>
                            `;
                            membersList.appendChild(newMember);
                            
                            // Update member count
                            updateMemberCount();
                            
                            // Add click handler to the new remove button
                            const newRemoveBtn = newMember.querySelector('.member-remove-btn');
                            if (newRemoveBtn) {
                              newRemoveBtn.addEventListener('click', () => {
                                const modal = document.getElementById('removeMemberModal');
                                const memberName = document.getElementById('memberToRemoveName');
                                if (memberName) memberName.textContent = 'Andrew Llego';
                                if (modal) modal.classList.add('active');
                              });
                            }
                          }
                          
                          // Close invite modal and show success modal
                          const inviteModal = document.getElementById('inviteModal');
                          const successModal = document.getElementById('requestAcceptedModal');
                          if (inviteModal) inviteModal.classList.remove('active');
                          setTimeout(() => {
                            if (successModal) successModal.classList.add('active');
                          }, 100);
                        }}>Accept</button>
                        <button className="btn btn-danger btn-sm" onClick={() => {
                          // Remove the request from join requests list
                          const requestItem = document.querySelector('.request-item');
                          if (requestItem) {
                            requestItem.remove();
                            // Update request count
                            updateRequestCount();
                          }
                          
                          // Close invite modal and show success modal
                          const inviteModal = document.getElementById('inviteModal');
                          const successModal = document.getElementById('requestDeclinedModal');
                          if (inviteModal) inviteModal.classList.remove('active');
                          setTimeout(() => {
                            if (successModal) successModal.classList.add('active');
                          }, 100);
                        }}>Decline</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add List Modal */}
      <div id="addListModal" className="modal">
        <div className="modal-content add-list-modal-content">
          <div className="modal-header">
            <h3>Add List</h3>
            <span className="close-modal" onClick={closeAddListModal}>&times;</span>
          </div>
          <div className="modal-body">
            <form id="addListForm" onSubmit={handleAddListSubmit}>
              <div className="form-group">
                <label htmlFor="listTitle">List Title</label>
                <input 
                  type="text" 
                  id="listTitle" 
                  name="title" 
                  className="form-control" 
                  required 
                  placeholder="Enter list title" 
                  maxLength="100"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeAddListModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add List</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Invitation Modal */}
      <div id="invitationSuccessModal" className="modal">
        <div className="modal-content success-modal-content">
          <div className="modal-body success-modal-body">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3>Invitation Sent!</h3>
            <p>The invitation has been sent successfully. The user will receive an email with instructions to join the board.</p>
            <button className="btn btn-primary success-ok-btn" onClick={closeInvitationSuccessModal}>OK</button>
          </div>
        </div>
      </div>

      {/* Remove Member Confirmation Modal */}
      <div id="removeMemberModal" className="modal">
        <div className="modal-content confirm-modal-content">
          <div className="modal-body confirm-modal-body">
            <div className="warning-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Remove Member</h3>
            <p>Are you sure you want to remove <span id="memberToRemoveName"></span> from this board? This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={closeRemoveMemberModal}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmRemoveMember}>Remove</button>
            </div>
          </div>
        </div>
      </div>

      {/* Request Accepted Success Modal */}
      <div id="requestAcceptedModal" className="modal">
        <div className="modal-content success-modal-content">
          <div className="modal-body success-modal-body">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3>Request Accepted!</h3>
            <p>The join request has been accepted. The user has been added to the board and will receive a notification.</p>
            <button className="btn btn-primary success-ok-btn" onClick={closeRequestAcceptedModal}>OK</button>
          </div>
        </div>
      </div>

      {/* Request Declined Success Modal */}
      <div id="requestDeclinedModal" className="modal">
        <div className="modal-content success-modal-content">
          <div className="modal-body success-modal-body">
            <div className="success-icon">
              <i className="fas fa-times-circle" style={{color: '#ef4444'}}></i>
            </div>
            <h3>Request Declined</h3>
            <p>The join request has been declined. The user will be notified of the decision.</p>
            <button className="btn btn-primary success-ok-btn" onClick={closeRequestDeclinedModal}>OK</button>
          </div>
        </div>
      </div>

      {/* Member Removed Success Modal */}
      <div id="memberRemovedModal" className="modal">
        <div className="modal-content success-modal-content">
          <div className="modal-body success-modal-body">
            <div className="success-icon">
              <i className="fas fa-user-minus" style={{color: '#ef4444'}}></i>
            </div>
            <h3>Member Removed</h3>
            <p>The member has been successfully removed from the board.</p>
            <button className="btn btn-primary success-ok-btn" onClick={closeMemberRemovedModal}>OK</button>
          </div>
        </div>
      </div>

      {/* Rename List Modal */}
      <div id="renameListModal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Rename List</h3>
            <button className="modal-close" onClick={closeRenameListModal}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="renameListInput">List Name</label>
              <input type="text" id="renameListInput" className="form-control" placeholder="Enter new list name" />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={closeRenameListModal}>Cancel</button>
            <button className="btn btn-primary" onClick={saveListRename}>Save</button>
          </div>
        </div>
      </div>

      {/* Delete List Confirmation Modal */}
      <div id="deleteConfirmationModal" className="modal">
        <div className="modal-content confirm-modal-content">
          <div className="modal-body confirm-modal-body">
            <div className="warning-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 id="deleteConfirmationTitle">Delete List</h3>
            <p id="deleteConfirmationMessage">Are you sure you want to delete this list? This action cannot be undone and will remove all cards in this list.</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" id="cancelDeleteBtn">Cancel</button>
              <button className="btn btn-danger" id="confirmDeleteBtn">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board;