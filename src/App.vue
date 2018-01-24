<template>
  <div id="app">
    <Mheader></Mheader>
    <Tab></Tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <Player></Player>
  </div>
</template>

<script type="text/ecmascript-6">
import Mheader from 'components/m-header/m-header'
import Tab from 'components/tab/tab'
import Player from 'components/player/player'
export default {
  components: {
    Mheader,
    Tab,
    Player
  }
}
</script>

<style lang="stylus" ref="stylesheet/stylus" scoped>
@import "~common/stylus/variable"
</style>
