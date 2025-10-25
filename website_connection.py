#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Website connection module for SavosBot Club
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

import aiohttp

logger = logging.getLogger(__name__)

class WebsiteConnection:
    def __init__(self, website_url: str, api_key: str):
        self.website_url = website_url.rstrip('/')
        self.api_key = api_key
        self.timeout = aiohttp.ClientTimeout(total=10)
        
    async def send_user_to_website(self, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Send user data to website"""
        try:
            payload = {
                **user_data,
                'source': 'telegram_bot'
            }
            
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.post(
                    f"{self.website_url}/api/users",
                    json=payload,
                    headers={
                        'Authorization': f'Bearer {self.api_key}',
                        'Content-Type': 'application/json'
                    }
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"✅ User data sent to website: {user_data['id']}")
                        return result
                    else:
                        logger.error(f"❌ Failed to send user to website: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"❌ Error sending user to website: {e}")
            return None
            
    async def get_user_from_website(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get user data from website"""
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(
                    f"{self.website_url}/api/users/{user_id}",
                    headers={
                        'Authorization': f'Bearer {self.api_key}',
                        'Content-Type': 'application/json'
                    }
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"❌ Failed to get user from website: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"❌ Error getting user from website: {e}")
            return None
            
    async def update_user_on_website(self, user_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user data on website"""
        try:
            payload = {
                **update_data,
                'source': 'telegram_bot'
            }
            
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.put(
                    f"{self.website_url}/api/users/{user_id}",
                    json=payload,
                    headers={
                        'Authorization': f'Bearer {self.api_key}',
                        'Content-Type': 'application/json'
                    }
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"✅ User data updated on website: {user_id}")
                        return result
                    else:
                        logger.error(f"❌ Failed to update user on website: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"❌ Error updating user on website: {e}")
            return None
            
    async def send_stats_to_website(self, stats: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Send statistics to website"""
        try:
            payload = {
                **stats,
                'source': 'telegram_bot',
                'timestamp': datetime.now().isoformat()
            }
            
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.post(
                    f"{self.website_url}/api/statistics",
                    json=payload,
                    headers={
                        'Authorization': f'Bearer {self.api_key}',
                        'Content-Type': 'application/json'
                    }
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info("✅ Statistics sent to website")
                        return result
                    else:
                        logger.error(f"❌ Failed to send stats to website: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"❌ Error sending stats to website: {e}")
            return None
            
    async def check_website_health(self) -> Dict[str, Any]:
        """Check website health"""
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(f"{self.website_url}/api/health") as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        return {'status': 'error', 'message': f'HTTP {response.status}'}
                        
        except Exception as e:
            logger.error(f"❌ Website health check failed: {e}")
            return {'status': 'error', 'message': str(e)}
            
    async def send_notification_to_website(self, notification: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Send notification to website"""
        try:
            payload = {
                **notification,
                'source': 'telegram_bot',
                'timestamp': datetime.now().isoformat()
            }
            
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.post(
                    f"{self.website_url}/api/notifications",
                    json=payload,
                    headers={
                        'Authorization': f'Bearer {self.api_key}',
                        'Content-Type': 'application/json'
                    }
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info("✅ Notification sent to website")
                        return result
                    else:
                        logger.error(f"❌ Failed to send notification to website: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"❌ Error sending notification to website: {e}")
            return None
            
    async def get_website_settings(self) -> Optional[Dict[str, Any]]:
        """Get website settings"""
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(
                    f"{self.website_url}/api/settings",
                    headers={
                        'Authorization': f'Bearer {self.api_key}',
                        'Content-Type': 'application/json'
                    }
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"❌ Failed to get website settings: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"❌ Error getting website settings: {e}")
            return None
            
    async def update_website_settings(self, settings: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update website settings"""
        try:
            payload = {
                **settings,
                'source': 'telegram_bot',
                'updated_at': datetime.now().isoformat()
            }
            
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.put(
                    f"{self.website_url}/api/settings",
                    json=payload,
                    headers={
                        'Authorization': f'Bearer {self.api_key}',
                        'Content-Type': 'application/json'
                    }
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info("✅ Website settings updated")
                        return result
                    else:
                        logger.error(f"❌ Failed to update website settings: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"❌ Error updating website settings: {e}")
            return None
            
    async def sync_data_with_website(self, data_type: str, data: Dict[str, Any]) -> bool:
        """Sync data with website"""
        try:
            if data_type == 'user':
                return await self.send_user_to_website(data) is not None
            elif data_type == 'stats':
                return await self.send_stats_to_website(data) is not None
            elif data_type == 'settings':
                return await self.update_website_settings(data) is not None
            else:
                logger.error(f"Unknown data type: {data_type}")
                return False
                
        except Exception as e:
            logger.error(f"Error syncing data with website: {e}")
            return False
