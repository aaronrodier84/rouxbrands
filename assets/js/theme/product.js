/*
 Import all product specific js
 */
import $ from 'jquery';
import _ from 'lodash';
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/form-utils';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        this.$buttonInc = $('[data-action="inc"]');
        this.$buttonDec = $('[data-action="dec"]');
        this.$qtyInput = $('.form-input--incrementTotal');
    }

    before(next) {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#writeReview') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        next();
    }

    loaded(next) {
        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);

        videoGallery();

        const $reviewForm = classifyForm('.writeReview-form');
        const review = new Review($reviewForm);

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation();
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        const increaseQty = _.bind(_.debounce(this.increaseQty, 100), this);
        this.$buttonInc.on('click', (event) => {
            increaseQty($(event.currentTarget));
            event.preventDefault();
            return false;
        });

        this.$buttonDec.on('click', (event) => {
            increaseQty($(event.currentTarget));
            event.preventDefault();
            return false;
        });

        next();
    }

    increaseQty($target) {
        const qtyStep = parseInt(this.$qtyInput.attr('data-quantity-min'), 10) === 0 ? 1 : parseInt(this.$qtyInput.attr('data-quantity-min'), 10);
        const oldQty = parseInt(this.$qtyInput.val(), 10);
        if ($target.data('action') === 'inc') {
            this.$qtyInput.val(oldQty + qtyStep);
        } else {
            if (oldQty > qtyStep) {
                this.$qtyInput.val(oldQty - qtyStep);
            }
        }
    }

    after(next) {
        this.productReviewHandler();

        next();
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.click();
        }
    }
}
