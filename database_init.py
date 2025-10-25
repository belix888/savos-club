#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Database initialization and management for SavosBot Club
"""

import os
import json
import logging
from datetime import datetime, date
from typing import Dict, List, Optional, Any
from pathlib import Path

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.data_dir = Path("data")
        self.users_file = self.data_dir / "users.json"
        self.settings_file = self.data_dir / "settings.json"
        self.statistics_file = self.data_dir / "statistics.json"
        
    async def initialize(self):
        """Initialize database structure"""
        try:
            logger.info("🔄 Initializing database...")
            
            # Create data directory
            self.data_dir.mkdir(exist_ok=True)
            logger.info("✅ Created data directory")
            
            # Initialize databases
            await self._init_users_database()
            await self._init_settings_database()
            await self._init_statistics_database()
            
            logger.info("✅ Database initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            raise
            
    async def _init_users_database(self):
        """Initialize users database"""
        if not self.users_file.exists():
            initial_users = []
            with open(self.users_file, 'w', encoding='utf-8') as f:
                json.dump(initial_users, f, ensure_ascii=False, indent=2)
            logger.info("✅ Users database initialized")
            
    async def _init_settings_database(self):
        """Initialize settings database"""
        if not self.settings_file.exists():
            initial_settings = {
                "bot_name": "SavosBot Club",
                "welcome_message": "Добро пожаловать в SavosBot Club!",
                "website_url": os.getenv('WEBSITE_URL', 'https://your-app.vercel.app'),
                "admin_panel_url": f"{os.getenv('WEBSITE_URL', 'https://your-app.vercel.app')}/admin-panel",
                "maintenance_mode": False,
                "max_users": 1000,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            with open(self.settings_file, 'w', encoding='utf-8') as f:
                json.dump(initial_settings, f, ensure_ascii=False, indent=2)
            logger.info("✅ Settings database initialized")
            
    async def _init_statistics_database(self):
        """Initialize statistics database"""
        if not self.statistics_file.exists():
            initial_stats = {
                "total_users": 0,
                "active_users": 0,
                "total_messages": 0,
                "total_commands": 0,
                "daily_stats": {},
                "monthly_stats": {},
                "created_at": datetime.now().isoformat(),
                "last_updated": datetime.now().isoformat()
            }
            
            with open(self.statistics_file, 'w', encoding='utf-8') as f:
                json.dump(initial_stats, f, ensure_ascii=False, indent=2)
            logger.info("✅ Statistics database initialized")
            
    async def save_user(self, user_data: Dict[str, Any]) -> bool:
        """Save user data"""
        try:
            # Read existing users
            users = await self._read_users()
            
            # Check if user exists
            user_index = next((i for i, user in enumerate(users) if user['id'] == user_data['id']), None)
            
            if user_index is not None:
                # Update existing user
                users[user_index].update(user_data)
                users[user_index]['updated_at'] = datetime.now().isoformat()
            else:
                # Add new user
                user_data['created_at'] = datetime.now().isoformat()
                user_data['updated_at'] = datetime.now().isoformat()
                users.append(user_data)
                
            # Save users
            await self._write_users(users)
            
            # Update statistics
            await self._update_statistics()
            
            logger.info(f"✅ User data saved: {user_data['id']}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving user data: {e}")
            return False
            
    async def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            users = await self._read_users()
            return next((user for user in users if user['id'] == user_id), None)
        except Exception as e:
            logger.error(f"Error getting user: {e}")
            return None
            
    async def update_user(self, user_id: int, update_data: Dict[str, Any]) -> bool:
        """Update user data"""
        try:
            users = await self._read_users()
            user_index = next((i for i, user in enumerate(users) if user['id'] == user_id), None)
            
            if user_index is not None:
                users[user_index].update(update_data)
                users[user_index]['updated_at'] = datetime.now().isoformat()
                await self._write_users(users)
                await self._update_statistics()
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return False
            
    async def get_all_users(self) -> List[Dict[str, Any]]:
        """Get all users"""
        try:
            return await self._read_users()
        except Exception as e:
            logger.error(f"Error getting all users: {e}")
            return []
            
    async def get_statistics(self) -> Dict[str, Any]:
        """Get statistics"""
        try:
            users = await self._read_users()
            today = date.today().isoformat()
            
            total_users = len(users)
            active_users = len([user for user in users if user.get('is_active', True)])
            today_users = len([user for user in users if user.get('joined_at', '').startswith(today)])
            
            return {
                'total_users': total_users,
                'active_users': active_users,
                'today_users': today_users
            }
            
        except Exception as e:
            logger.error(f"Error getting statistics: {e}")
            return {'total_users': 0, 'active_users': 0, 'today_users': 0}
            
    async def get_settings(self) -> Optional[Dict[str, Any]]:
        """Get settings"""
        try:
            if self.settings_file.exists():
                with open(self.settings_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return None
        except Exception as e:
            logger.error(f"Error getting settings: {e}")
            return None
            
    async def update_settings(self, update_data: Dict[str, Any]) -> bool:
        """Update settings"""
        try:
            settings = await self.get_settings()
            if settings:
                settings.update(update_data)
                settings['updated_at'] = datetime.now().isoformat()
                
                with open(self.settings_file, 'w', encoding='utf-8') as f:
                    json.dump(settings, f, ensure_ascii=False, indent=2)
                return True
            return False
        except Exception as e:
            logger.error(f"Error updating settings: {e}")
            return False
            
    async def _read_users(self) -> List[Dict[str, Any]]:
        """Read users from file"""
        if self.users_file.exists():
            with open(self.users_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
        
    async def _write_users(self, users: List[Dict[str, Any]]):
        """Write users to file"""
        with open(self.users_file, 'w', encoding='utf-8') as f:
            json.dump(users, f, ensure_ascii=False, indent=2)
            
    async def _update_statistics(self):
        """Update statistics"""
        try:
            stats = await self.get_statistics()
            
            if self.statistics_file.exists():
                with open(self.statistics_file, 'r', encoding='utf-8') as f:
                    full_stats = json.load(f)
            else:
                full_stats = {}
                
            full_stats.update({
                'total_users': stats['total_users'],
                'active_users': stats['active_users'],
                'last_updated': datetime.now().isoformat()
            })
            
            with open(self.statistics_file, 'w', encoding='utf-8') as f:
                json.dump(full_stats, f, ensure_ascii=False, indent=2)
                
        except Exception as e:
            logger.error(f"Error updating statistics: {e}")
