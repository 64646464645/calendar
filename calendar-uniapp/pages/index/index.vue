<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>
		<view class="text-area">
			<text class="title">欢迎使用日历应用</text>
		</view>
		<button class="navigate-btn" @click="goToCalendar">进入日历</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: '日历应用'
			}
		},
		onLoad() {

		},
		methods: {
			goToCalendar() {
				uni.navigateTo({
					url: '/pages/calendar/calendar'
				});
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 100px;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
		margin-bottom: 50px;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}

	.navigate-btn {
		width: 200px;
		height: 40px;
		background-color: #007AFF;
		color: white;
		border: none;
		border-radius: 20px;
	}
</style>