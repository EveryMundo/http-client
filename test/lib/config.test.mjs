/* eslint-env mocha */
import { expect } from 'chai'

import { box } from '../test-setup.js'
import config from '../../lib/config.js'

describe('lib/config.js', () => {
  describe('SIMULATE', () => {
    it('should default to false', () => {
      expect(config.SIMULATE).to.equal(0)
    })

    describe('when env.SIMULATE has a numeric value', () => {
      it('should set config.SIMULATE value', () => {
        const cfg = new config.constructor({ SIMULATE: 1 })

        expect(cfg.SIMULATE).to.equal(1)
      })
    })
  })

  describe('MAX_RETRY_ATTEMPTS', () => {
    it('should default to 3', () => {
      expect(config.MAX_RETRY_ATTEMPTS).to.equal(3)
    })

    describe('when env.MAX_RETRY_ATTEMPTS has a numeric value', () => {
      it('should set config.MAX_RETRY_ATTEMPTS value', () => {
        const cfg = new config.constructor({ MAX_RETRY_ATTEMPTS: 5 })

        expect(cfg.MAX_RETRY_ATTEMPTS).to.equal(5)
      })
    })
  })

  describe('RETRY_TIMEOUT_MS', () => {
    it('should default to 500', () => {
      expect(config.RETRY_TIMEOUT_MS).to.equal(500)
    })

    describe('when env.RETRY_TIMEOUT_MS has a numeric value', () => {
      it('should set config.RETRY_TIMEOUT_MS value', () => {
        const cfg = new config.constructor({ RETRY_TIMEOUT_MS: 1000 })

        expect(cfg.RETRY_TIMEOUT_MS).to.equal(1000)
      })
    })
  })

  describe('REQUEST_TIMEOUT_MS', () => {
    it('should default to undefined', () => {
      expect(config.REQUEST_TIMEOUT_MS).to.equal(undefined)
    })

    describe('when env.REQUEST_TIMEOUT_MS has a numeric value', () => {
      it('should set config.REQUEST_TIMEOUT_MS value', () => {
        const cfg = new config.constructor({ REQUEST_TIMEOUT_MS: 1000 })

        expect(cfg.REQUEST_TIMEOUT_MS).to.equal(1000)
      })
    })
  })

  describe('EMHC_LOG_LEVEL', () => {
    it('should default to error', () => {
      expect(config.EMHC_LOG_LEVEL).to.equal('error')
    })
  })
})
